from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google import genai
import traceback

from django.http import JsonResponse, HttpResponseNotFound
import os

import os
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from django.http import JsonResponse
from django.conf import settings
import os

from django.conf import settings
from django.http import JsonResponse
import os

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
def ask_gemini(request):
    try:
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
        
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        message = response.text
        return Response({"response": message}, status=status.HTTP_200_OK)

    except Exception as e:
        # Log full traceback to console
        print("Error in ask_gemini view:")
        traceback.print_exc()
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
