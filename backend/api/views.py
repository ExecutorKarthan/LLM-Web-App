import json
import os
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import redis

@csrf_exempt  # Disable CSRF for now; you can improve this later
def store_api_key(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            api_key = data.get("apiKey")

            if not api_key:
                return JsonResponse({"error": "API key required"}, status=400)

            # Generate unique token
            token = str(uuid.uuid4())

            redis_url = os.environ.get("REDIS_URL")
            if not redis_url:
                return JsonResponse({"error": "Redis URL not configured"}, status=500)

            connection = redis.Redis.from_url(redis_url, ssl=True)

            # Store key with 1-hour expiry
            connection.set(f"api_key:{token}", api_key, ex=3600)

            return JsonResponse({"success": True, "token": token})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST method required"}, status=405)

@csrf_exempt
def ask_with_key(request):
    if request.method == "POST":
        data = json.loads(request.body)
        token = data.get("token")
        prompt = data.get("prompt")

        if not token or not prompt:
            return JsonResponse({"error": "Missing token or prompt."}, status=400)

        api_key = cache.get(f"api_key:{token}")
        if not api_key:
            return JsonResponse({"error": "API key expired or invalid."}, status=403)

        # Use the API key (mocked here)
        return JsonResponse({"response": f"API call with: {prompt} using key: {api_key[:4]}****"})


@csrf_exempt
def remove_api_key(request):
    if request.method == "POST":
        data = json.loads(request.body)
        token = data.get("token")
        if token:
            cache.delete(f"api_key:{token}")
        return JsonResponse({"status": "cleared"})

def get_api_key_from_token(token):
    redis_url = os.environ.get("REDIS_URL")
    connection = redis.Redis.from_url(redis_url, ssl=True)
    api_key = connection.get(f"api_key:{token}")
    if api_key:
        return api_key.decode("utf-8")
    return None