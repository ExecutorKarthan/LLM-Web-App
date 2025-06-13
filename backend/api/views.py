from rest_framework.decorators import api_view
from rest_framework.response import Response
import openai
import os

@api_view(["POST"])
def ask_openai(request):
    prompt = request.data.get("prompt", "")
    
    openai.api_key = os.getenv("OPENAI_API_KEY")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        message = response['choices'][0]['message']['content']
        return Response({"response": message})
    
    except Exception as e:
        return Response({"error": str(e)}, status=500)
