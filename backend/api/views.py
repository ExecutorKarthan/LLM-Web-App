from rest_framework.decorators import api_view
from rest_framework.response import Response
from google import genai
import os

@api_view(["POST"])
def ask_openai(request):
    prompt = request.data.get("prompt", "")
    api_key = os.getenv("GEMINI_KEY")

    if not api_key:
        return Response({"error": "OpenAI API key is not set."}, status=500)

    client = genai.Client(api_key=api_key)

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents= prompt
        )
        message = response.text
        return Response({"response": message})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
