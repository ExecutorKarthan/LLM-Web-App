# Import needed modules
import os
from django.core.asgi import get_asgi_application

# Set environment variable for ASGI entry
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

# Create AGSI application
application = get_asgi_application()
