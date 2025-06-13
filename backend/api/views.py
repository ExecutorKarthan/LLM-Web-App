from rest_framework.decorators import api_view
from rest_framework.response import Response
import openai
import os

@api_view(["POST"])
def ask_openai(request):
    prompt = request.data.get("prompt", "")
    api_key = os.getenv("OPENAI_KEY")

    if not api_key:
        return Response({"error": "OpenAI API key is not set."}, status=500)

    client = openai.OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="o3",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        message = response.choices[0].message.content
        return Response({"response": message})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
