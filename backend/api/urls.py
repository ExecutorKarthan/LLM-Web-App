from django.urls import path
from . import views

urlpatterns = [
    path("store-key/", views.store_api_key),
    path("ask/", views.ask_with_key),
    path("remove-key/", views.remove_api_key),
]
