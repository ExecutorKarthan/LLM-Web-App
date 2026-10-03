# Standard library imports
import os
import time
import uuid
import json
import logging

# Django / DRF imports
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.core.cache import cache
from django.middleware.csrf import get_token

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Google Gemini SDK
from google import genai
from google.genai.errors import ClientError, ServerError

# HTTP client (for catching low-level connection errors from Gemini)
import httpx

logger = logging.getLogger(__name__)

# ── Gemini auth pattern used throughout this file ──────────────────────────
# The frontend never holds the raw Gemini API key after the initial submit.
# `tokenize_key` exchanges it for a random UUID, stores the real key
# server-side in Django's cache under that UUID, and sends the UUID back as
# an httponly `gemini_token` cookie. Gemini-calling views read the cookie,
# look up the key in the cache, then call the SDK with it.
#
# NOTE: this only works across requests if the cache is shared by every
# worker process (e.g. Redis). With the default per-process LocMemCache,
# run a single gunicorn worker or tokens will randomly fail to resolve.
#
# Secrets policy: never log the API key (or any prefix of it) or the token.

TOKEN_TIMEOUT_SECONDS = 5400  # 90 minutes


############################################
# CSRF token endpoint
############################################
@ensure_csrf_cookie
def get_csrf_token(request):
    """Return CSRF token for frontend."""
    return JsonResponse({"csrfToken": get_token(request)})


############################################
# Cookie / token validity check
############################################
def check_cookie(request):
    """
    Reports whether the caller holds a gemini_token cookie that still
    resolves to a cached API key. Checking the cache (not just the cookie)
    means the frontend shows the splashgate again after a server restart
    or cache eviction, instead of failing later with a 403.
    """
    token = request.COOKIES.get("gemini_token")
    token_valid = False
    if token:
        try:
            token_valid = cache.get(token) is not None
        except Exception:
            logger.error("[CHECK_COOKIE] Cache lookup failed", exc_info=True)
    return JsonResponse({"token_exists": token_valid})


############################################
# Tokenize API key into cache + secure cookie
############################################
@csrf_exempt
@ensure_csrf_cookie
def tokenize_key(request):
    """
    Exchanges a raw Gemini API key (sent once, in the POST body) for an
    opaque UUID token stored in the cache for 90 minutes, and sets that
    UUID as an httponly cookie. Reads the value back after storing it so
    a broken cache backend fails loudly here, not later in another view.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        body = json.loads(request.body)
        api_key = (body.get("apiKey") or "").strip()
        if not api_key:
            return JsonResponse({"error": "API key is required"}, status=400)

        token = str(uuid.uuid4())
        cache.set(token, api_key, timeout=TOKEN_TIMEOUT_SECONDS)

        if cache.get(token) != api_key:
            logger.error("[TOKENIZE] Cache write did not round-trip")
            return JsonResponse({"error": "Failed to store token in cache"}, status=500)

        response = JsonResponse({"message": "Token set in secure cookie."})
        response.set_cookie(
            key="gemini_token",
            value=token,
            max_age=TOKEN_TIMEOUT_SECONDS,
            secure=not settings.DEBUG,
            httponly=True,
            samesite="Lax",
            path="/",
        )
        return response

    except Exception as e:
        logger.error(f"[TOKENIZE] ERROR: {e}", exc_info=True)
        return JsonResponse({"error": "Server error", "details": str(e)}, status=500)


def get_puzzles(request):
    code_dir = getattr(settings, 'PUZZLE_CODE_DIR', settings.BASE_DIR / "assets" / "puzzles")
    static_files_root = settings.STATICFILES_DIRS[0]

    puzzles = []

    if not os.path.exists(code_dir):
        return JsonResponse([], safe=False)

    for filename in os.listdir(code_dir):
        if not filename.endswith(".txt"):
            continue

        puzzle_id = os.path.splitext(filename)[0]
        code_file_path = code_dir / filename
        
        try:
            code = code_file_path.read_text(encoding="utf-8")
        except Exception:
            continue

        # Look for the exact base name (preserving capitalization like smallLinear)
        image_filename = f"{puzzle_id}.png"
        image_file_path = os.path.join(static_files_root, image_filename)

        if not os.path.exists(image_file_path):
            # Fallback check if file is lowercase
            lower_image_filename = f"{puzzle_id.lower()}.png"
            if os.path.exists(os.path.join(static_files_root, lower_image_filename)):
                image_filename = lower_image_filename
            else:
                continue

        puzzles.append({
            "id": puzzle_id,
            "title": f"Puzzle {puzzle_id.replace('puzzle', '').title()}",
            "code": code,
            "image_url": f"{settings.STATIC_URL}{image_filename}",
        })

    return JsonResponse(puzzles, safe=False)

############################################
# Test API key (DEBUG)
############################################
@csrf_exempt
@api_view(["GET"])
def test_api_key(request):
    """Debug endpoint to test if the stored API key works"""
    logger.info("=" * 80)
    logger.info("[TEST_KEY] Request received")

    token = request.COOKIES.get("gemini_token")
    if not token:
        return Response({"error": "No token"}, status=401)

    api_key = cache.get(token)
    if not api_key:
        return Response({"error": "Invalid token"}, status=403)

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say hello",
        )
        logger.info("[TEST_KEY] API key works!")
        logger.info("=" * 80)
        return Response({"success": True, "api_key_works": True, "response": response.text})
    except Exception as e:
        logger.error(f"[TEST_KEY] Error: {e}", exc_info=True)
        logger.info("=" * 80)
        return Response({"success": False, "error": str(e), "error_type": type(e).__name__}, status=400)

############################################
# Dead-model cache
#
# Some rejections mean a model will never work for this key (paid-tier-only,
# or sunset for this account). Remember those so we stop wasting a request
# on them. Quota exhaustion (RESOURCE_EXHAUSTED) is transient and is NOT
# cached.
############################################
DEAD_MODEL_CACHE_PREFIX = "gemini_dead_model:"
DEAD_MODEL_CACHE_TIMEOUT = 60 * 60 * 24 * 7  # 1 week


def _dead_model_cache_key(token, model_name):
    return f"{DEAD_MODEL_CACHE_PREFIX}{token}:{model_name}"


def _mark_model_dead(token, model_name, reason):
    cache.set(_dead_model_cache_key(token, model_name), reason, timeout=DEAD_MODEL_CACHE_TIMEOUT)


def _dead_model_reason(token, model_name):
    return cache.get(_dead_model_cache_key(token, model_name))


def _looks_like_deprecated_for_key(error_message: str) -> bool:
    """Model sunset for this key/account (e.g. 404 'no longer available')."""
    signals = ["no longer available", "NOT_FOUND"]
    lowered = error_message.lower()
    return any(s.lower() in lowered for s in signals)


def _looks_like_paid_only_rejection(error_message: str) -> bool:
    """Model exists but needs a paid/billing-enabled account."""
    signals = [
        "not available on the free tier",
        "requires a billing account",
        "billing account is required",
        "FAILED_PRECONDITION",
        "PERMISSION_DENIED",
    ]
    lowered = error_message.lower()
    return any(s.lower() in lowered for s in signals)


############################################
# Shared Gemini model-fallback caller
############################################
# Copied from the working template. Verify these names against Google's
# current model list; unavailable ones are skipped automatically.
GEMINI_MODEL_NAMES = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
]


def _call_gemini_with_fallback(client, token, prompt, log_prefix, max_retries=2, delay=2):
    """
    Tries each model in GEMINI_MODEL_NAMES in order, skipping models known
    dead for this token, retrying a model with exponential backoff only on
    a transient UNAVAILABLE error, and moving to the next model on quota
    exhaustion, a permanent per-key rejection, or a network error.

    Returns a dict with exactly one of:
      {"text": str, "model_used": str, "warnings": list[str]}
      {"error_response": Response}
    """
    warnings = []

    for model_name in GEMINI_MODEL_NAMES:
        dead_reason = _dead_model_reason(token, model_name)
        if dead_reason:
            msg = f"Skipping {model_name} (previously unavailable: {dead_reason}), trying next model."
            logger.info(f"[{log_prefix}] {msg}")
            warnings.append(msg)
            continue

        for attempt in range(max_retries):
            try:
                logger.info(f"[{log_prefix}] Trying {model_name} (attempt {attempt + 1}/{max_retries})")
                response = client.models.generate_content(model=model_name, contents=prompt)
                response_text = response.text if response.text is not None else ""
                logger.info(f"[{log_prefix}] SUCCESS with {model_name}")
                return {"text": response_text, "model_used": model_name, "warnings": warnings}

            except ClientError as e:
                error_message = str(e)
                logger.error(f"[{log_prefix}] ClientError with {model_name}: {error_message}")

                if "API_KEY_INVALID" in error_message or "API key not valid" in error_message:
                    return {"error_response": Response(
                        {"error": "Invalid or unauthorized API key provided."},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )}

                if "RESOURCE_EXHAUSTED" in error_message or "quota" in error_message.lower():
                    msg = f"{model_name} hit its quota limit, trying next model."
                    logger.warning(f"[{log_prefix}] {msg}")
                    warnings.append(msg)
                    break  # transient: do not blacklist

                if _looks_like_deprecated_for_key(error_message):
                    msg = f"{model_name} is no longer available for this API key, trying next model."
                    logger.warning(f"[{log_prefix}] {msg}")
                    _mark_model_dead(token, model_name, "deprecated for this key")
                    warnings.append(msg)
                    break

                if _looks_like_paid_only_rejection(error_message):
                    msg = f"{model_name} requires a paid account, trying next model."
                    logger.warning(f"[{log_prefix}] {msg}")
                    _mark_model_dead(token, model_name, "requires paid tier")
                    warnings.append(msg)
                    break

                return {"error_response": Response(
                    {"error": f"Client error with {model_name}: {error_message}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )}

            except ServerError as e:
                if "UNAVAILABLE" in str(e):
                    logger.warning(f"[{log_prefix}] {model_name} unavailable, retrying...")
                    time.sleep(delay * (2 ** attempt))
                    continue
                logger.error(f"[{log_prefix}] ServerError: {e}", exc_info=True)
                return {"error_response": Response(
                    {"error": f"Server error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )}

            except (httpx.RemoteProtocolError, httpx.ConnectError, httpx.ReadError) as e:
                msg = f"Network error reaching {model_name}, trying next model."
                logger.warning(f"[{log_prefix}] {msg}: {e}")
                warnings.append(msg)
                break

            except Exception as e:
                logger.error(f"[{log_prefix}] Unexpected error: {e}", exc_info=True)
                return {"error_response": Response(
                    {"error": f"Unexpected error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )}

    logger.error(f"[{log_prefix}] FAILURE: all models exhausted")
    return {"error_response": Response(
        {
            "error": "All Gemini models are currently unavailable or quota exceeded.",
            "warnings": warnings,
        },
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )}


############################################
# Gemini query endpoint
############################################
@csrf_exempt
@api_view(["POST"])
def ask_gemini(request, max_retries=2, delay=2):
    """
    Sends `prompt` to Gemini using the API key resolved from the caller's
    gemini_token cookie, via the shared model-fallback loop. The response
    includes a `warnings` list describing any models skipped along the way.
    """
    token = request.COOKIES.get("gemini_token")
    if not token:
        return Response({"error": "Missing gemini_token cookie."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        api_key = cache.get(token)
    except Exception as cache_error:
        logger.error(f"[ASK_GEMINI] Cache error: {cache_error}", exc_info=True)
        return Response({"error": "Cache error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if not api_key:
        return Response({"error": "Invalid or expired token."}, status=status.HTTP_403_FORBIDDEN)

    prompt = request.data.get("prompt")
    if not prompt:
        return Response({"error": "Prompt is missing in request."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        logger.error(f"[ASK_GEMINI] Failed to create Gemini client: {e}", exc_info=True)
        return Response({"error": f"Failed to create Gemini client: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    result = _call_gemini_with_fallback(client, token, prompt, "ASK_GEMINI", max_retries=max_retries, delay=delay)
    if "error_response" in result:
        return result["error_response"]

    return Response(
        {"response": result["text"], "model_used": result["model_used"], "warnings": result["warnings"]},
        status=status.HTTP_200_OK,
    )


############################################
# Clear token + cookie
############################################
@csrf_exempt
@api_view(["POST"])
def clear_token(request):
    """Deletes the cached API key (if any) and clears the cookie."""
    token = request.COOKIES.get("gemini_token")
    if token:
        cache.delete(token)

    response = JsonResponse({"message": "Token cleared."})
    response.delete_cookie("gemini_token", path="/", samesite="Lax")
    return response