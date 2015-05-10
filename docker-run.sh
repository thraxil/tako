#!/bin/bash

cd /var/www/tako/tako/
python manage.py migrate --noinput --settings=tako.settings_docker
python manage.py collectstatic --noinput --settings=tako.settings_docker
python manage.py compress --settings=tako.settings_docker
exec gunicorn --env \
  DJANGO_SETTINGS_MODULE=tako.settings_docker \
  tako.wsgi:application -b 0.0.0.0:8000 -w 3 \
  --access-logfile=- --error-logfile=-
