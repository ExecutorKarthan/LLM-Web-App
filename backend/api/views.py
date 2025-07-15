import time
import traceback
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google import genai
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from google.genai.errors import ClientError, ServerError

def get_puzzles(request):
    code_dir = settings.BASE_DIR / "assets" / "puzzles"
    # This correctly points to 'backend/assets/static'
    static_files_root = settings.STATICFILES_DIRS[0] 

    puzzles = []
    for filename in os.listdir(code_dir):
        if not filename.endswith(".txt"):
            continue

        puzzle_id = os.path.splitext(filename)[0]  # e.g. "puzzle1"
        code_path = code_dir / filename
        
        # Correctly form the file system path to the image
        image_filename = f"{puzzle_id}.png"
        image_file_path = os.path.join(static_files_root, image_filename)

        # Check if the image file actually exists on the file system
        if not os.path.exists(image_file_path):
            continue

        code = code_path.read_text()

        puzzles.append({
            "id": puzzle_id,
            "title": f"Puzzle {puzzle_id.replace('puzzle', '')}",
            "code": code,
            # This is the URL clients will use to access the image
            "image_url": f"{settings.STATIC_URL}{image_filename}", 
        })

    return JsonResponse(puzzles, safe=False)

@api_view(["POST"])
def ask_gemini(request, max_retries=2, delay=2):
    from google.genai.errors import ClientError, ServerError

    model_names = [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]

    prompt = request.data.get("prompt")
    api_key = request.data.get("apiKey")

    if not api_key:
        return Response(
            {"error": "API key is missing in request."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not prompt:
        return Response(
            {"error": "Prompt is missing in request."},
            status=status.HTTP_400_BAD_REQUEST
        )

    for model_name in model_names:
        for attempt in range(max_retries):
            try:
                print(f"Trying model: {model_name} (Attempt {attempt + 1})")
                client = genai.Client(api_key=api_key)

                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                message = response.text
                return Response({"response": message}, status=status.HTTP_200_OK)

            except ClientError as e:
                error_message = str(e)
                if "API key not valid" in error_message or "API_KEY_INVALID" in error_message:
                    return Response(
                        {"error": "Invalid or unauthorized API key provided."},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                return Response(
                    {"error": f"Client error: {error_message}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            except ServerError as e:
                if "UNAVAILABLE" in str(e):
                    print(f"Model {model_name} unavailable. Retrying after delay...")
                    time.sleep(delay * (2 ** attempt))
                    continue
                return Response(
                    {"error": f"Server error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            except Exception as e:
                return Response(
                    {"error": f"Unexpected error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

    return Response(
        {"error": "All Gemini models are currently unavailable. Please try again later."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE
    )