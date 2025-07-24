# Imports needed modules
import time
import os
import uuid, json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from google import genai
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from google.genai.errors import ClientError, ServerError

# Function to retrieve image and code for each puzzle
def get_puzzles(request):
    # Defines where to fine the puzzles on the server
    code_dir = settings.BASE_DIR / "assets" / "puzzles"
    static_files_root = settings.STATICFILES_DIRS[0] 
    
    # Create a list to hold found puzzle objects
    puzzles = []
    
    # Iterate through the files found and make objects to be passed to the front end
    for filename in os.listdir(code_dir):
        #Ignore non-text files
        if not filename.endswith(".txt"):
            continue
        
        # Define the ID and path for a given puzzle's code
        puzzle_id = os.path.splitext(filename)[0]
        code_path = code_dir / filename
        
        # Save the code for the puzzle
        code = code_path.read_text()
        
        # Define the file name and path for the puzzle's image
        image_filename = f"{puzzle_id}.png"
        image_file_path = os.path.join(static_files_root, image_filename)

        # Check if the image file actually exists on the file system
        if not os.path.exists(image_file_path):
            continue      

        # Create the puzzle object and add it to the list of puzzles
        puzzles.append({
            "id": puzzle_id,
            "title": f"Puzzle {puzzle_id.replace('puzzle', '')}",
            "code": code,
            "image_url": f"{settings.STATIC_URL}{image_filename}", 
        })
    
    # Pass the list of puzzle objects to the frontend in JSON format
    return JsonResponse(puzzles, safe=False)

# Add a function to check if there is already a cookie ready to use
def check_cookie(request):
    token = request.COOKIES.get("gemini_token")
    if token:
        return JsonResponse({"token_exists": True})
    else:
        return JsonResponse({"token_exists": False})

# Add a function to tokenize the API key for security reasons
@csrf_exempt
def tokenize_key(request):
    # Check the method and if it is a post method, execute the code
    if request.method == "POST":
        try:
            # Retrieve the data and get the api key
            body = json.loads(request.body)
            api_key = body.get("apiKey")
            if not api_key:
                return JsonResponse({ "error": "API key is required" }, status=400)
            # Create a random token and save it in the cache
            token = str(uuid.uuid4())
            cache.set(token, api_key, timeout=5400)

            # Set token in secure, HttpOnly cookie instead of returning it in JSON
            response = JsonResponse({ "message": "Token set in secure cookie." })
            response.set_cookie(
                key="gemini_token",
                value=token,
                max_age=5400,              
                secure=True,              
                httponly=True,            
                samesite="None",
                path="/"
            )
            return response
        except Exception as e:
            return JsonResponse({ "error": "Server error", "details": str(e) }, status=500)
    return JsonResponse({ "error": "Invalid request method" }, status=405)

# Restricts the view to only POST requests for asking the LLM
@api_view(["POST"])
# Create a function to handle querying the LLM
def ask_gemini(request, max_retries=2, delay=2):
    # Define a list of Gemini models to be used
    model_names = [
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]

    # Get token from cookie instead of header
    token = request.COOKIES.get("gemini_token")
    if not token:
        return Response(
            {"error": "Missing gemini_token cookie."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    # Lookup API key from cache
    api_key = cache.get(token)
    if not api_key:
        return Response(
            {"error": "Invalid or expired token."},
            status=status.HTTP_403_FORBIDDEN
        )
    # Get user prompt
    prompt = request.data.get("prompt")
    if not prompt:
        return Response(
            {"error": "Prompt is missing in request."},
            status=status.HTTP_400_BAD_REQUEST
        )
    # Iterate through each model and attempt to query it. If that fails, reattempt and then move to the next model
    for model_name in model_names:
        for attempt in range(max_retries):
            # Attempt to query the model
            try:
                print(f"Trying model: {model_name} (Attempt {attempt + 1})")
                # Establish a connection to the model with the provided API key
                client = genai.Client(api_key=api_key)

                # Pass the model the prompt and store the response
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                message = response.text     
                #Return the response from the model
                return Response({"response": message}, status=status.HTTP_200_OK)
            # Respond with an error if the LLM query failed due to an invalid API key
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
            # Respond with an error if the LLM query failed due to the server. Retry after a delay
            except ServerError as e:
                if "UNAVAILABLE" in str(e):
                    print(f"Model {model_name} unavailable. Retrying after delay...")
                    time.sleep(delay * (2 ** attempt))
                    continue
                return Response(
                    {"error": f"Server error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            # Respond with an error if the LLM query failed due to some other error
            except Exception as e:
                return Response(
                    {"error": f"Unexpected error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    # Respond with an error if the LLM query failed and no model is available 
    return Response(
        {"error": "All Gemini models are currently unavailable. Please try again later."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE
    )

# Add a view to clear a token from cache and clear the cookie
@api_view(["POST"])
def clear_token(request):
    # Check to see if there is a token
    token = request.COOKIES.get("gemini_token") 
    # Delete the token from cache
    if token:
        cache.delete(token)
    # Respond and then delete the cookie
    response = JsonResponse({"message": "Token cleared."})
    response.delete_cookie("gemini_token", samesite='Lax')
    return response
