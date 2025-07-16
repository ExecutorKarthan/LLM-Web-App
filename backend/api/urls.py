# Imports needed modules
from django.urls import path
from .views import get_puzzles, ask_gemini

# Defines URL routing for the server to properly handle requests
urlpatterns = [
    path("puzzles/", get_puzzles),
    path("ask/", ask_gemini),
]
