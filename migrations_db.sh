#!/bin/sh

while ! nc -z db 5432; do
  echo "Waiting for postgres..."
  sleep 1
done

# Optionally, you can capture its background job ID
job_id=$!

# If needed, wait for the background job to complete
wait $job_id

# Make new initial migrations
echo "Make migrations"
python /app/WebLUCIS/manage.py makemigrations

# Apply database migrations (marking the initial ones as applied)
echo "Apply database migrations"
python /app/WebLUCIS/manage.py migrate --fake-initial

# pass all arguments to the entrypoint script e.g., postgres from init_db.sh
exec "$@"