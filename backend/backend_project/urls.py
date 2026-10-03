# backend_project/urls.py
#
# This is the active URLconf (see settings.ROOT_URLCONF =
# "backend_project.urls"). Route order matters below: the WASM and
# /assets/ static routes must come before the catch-all SPA fallback,
# or the fallback would intercept those requests and serve index.html
# instead of the actual file (see the inline note further down for the
# specific bug this guards against).
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.contrib.staticfiles.urls import staticfiles_urlpatterns  
from backend_project.views import frontend
from api import views as api_views

# Root of the React dist folder — used for top-level static files
# like RDKit_minimal.wasm that sit outside the /assets/ prefix.
DIST_ROOT = settings.BASE_DIR.parent / "frontend" / "dist"

# Define URL patters for app navigation
urlpatterns = [
    path('admin/', admin.site.urls),
    
    path("api/ask/", api_views.ask_gemini),
    path("api/puzzles/", api_views.get_puzzles),
    
    # ── API endpoints ──────────────────────────────────────────────────────
    path("api/check-cookie/", api_views.check_cookie),
    path("api/tokenize-key/", api_views.tokenize_key),
    path("api/test-key/", api_views.test_api_key),
    path("api/csrf/", api_views.get_csrf_token),
    path("api/clear-token/", api_views.clear_token),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(
            r'^static/(?P<path>.*)$',
            serve,
            {'document_root': settings.BASE_DIR / 'assets' / 'static'}
        ),
    ]