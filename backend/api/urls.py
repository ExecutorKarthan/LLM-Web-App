from django.urls import path
from .views import ask_gemini
from .views import get_puzzle_code

urlpatterns = [
    path("ask/", ask_gemini),
    path("puzzles/<int:puzzle_id>/", get_puzzle_code),
]
