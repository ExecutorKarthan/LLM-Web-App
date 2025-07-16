# Import needed modules
import os
from django.core.wsgi import get_wsgi_application

#Sets environmental variables for WSGI entry point
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')

#Starts WSGI app
application = get_wsgi_application()
