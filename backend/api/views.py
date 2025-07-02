# views.py
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.cache import cache
import json
import os
import redis

@csrf_exempt
def store_api_key(request):
    token = "abc123"
    print(os.environ["REDIS_URL"])
    connection = redis.Redis.from_url(os.environ["REDIS_URL"])
    connection.set(f"api_key:{token}", "your-api-key-value")  # TTL 1 hour
    return JsonResponse({"success": True})



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
