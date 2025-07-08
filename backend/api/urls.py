from django.urls import path
from .views import get_puzzles, ask_gemini

urlpatterns = [
    path("puzzles/", get_puzzles),
    path("ask/", ask_gemini),
]
