from django.urls import path
from .views import ask_openai

urlpatterns = [
    path("ask/", ask_openai),
]
