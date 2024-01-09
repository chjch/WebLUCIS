#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL/PostGIS started"

# make migrations
echo "Make migrations"
python /app/WebLUCIS/manage.py makemigrations

# Apply database migrations
echo "Apply database migrations"
python /app/WebLUCIS/manage.py migrate

exec "$@"