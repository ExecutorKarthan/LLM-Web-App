# Define execution order for render to start
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn backend_project.asgi:application --worker-class uvicorn.workers.UvicornWorker --timeout 600 --workers 1 --bind 0.0.0.0:$PORT

