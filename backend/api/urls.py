# Imports needed modules
from django.urls import path
from .views import get_puzzles, ask_gemini, tokenize_key, clear_token

# Defines URL routing for the server to properly handle requests
urlpatterns = [
    path("tokenize-key/", tokenize_key),
    path("puzzles/", get_puzzles),
    path("ask/", ask_gemini),
     path('api/clear-token/', clear_token, name='clear_token'),
]
