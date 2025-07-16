# Define execution order for render to start
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn backend_project.wsgi:application --bind 0.0.0.0:$PORT
gunicorn backend_project.wsgi:application --timeout 120
