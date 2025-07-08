from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google import genai
import traceback

from django.http import JsonResponse, HttpResponseNotFound
import os

PUZZLE_DIR = os.path.join(os.path.dirname(__file__), '../assets/puzzles')

def get_puzzle_code(request, puzzle_id):
    filename = f"puzzle{puzzle_id}.txt"
    filepath = os.path.join(PUZZLE_DIR, filename)

    if not os.path.exists(filepath):
        return HttpResponseNotFound("Puzzle not found")

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    return JsonResponse({"code": content})

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
