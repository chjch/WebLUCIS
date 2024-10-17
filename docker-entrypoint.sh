#!/bin/sh

while ! nc -z db 5432; do
  echo "Waiting for postgres..."
  sleep 1
done

echo "PostgreSQL/PostGIS started"

# Function to check if a PostgreSQL extension is installed
check_db_extension() {
    # $1 - the first argument to the function (extension name, e.g. postgis)
    EXTENSION=$1
    # Run SQL command to check if the extension is installed
    # The SQL query returns 1 for each row that matches the condition in the WHERE clause
    # `grep -q 1` checks if the output contains 1
    if_exist=$(psql "postgresql://postgres:151010@db:5432/template_postgis" \
    -tAc "SELECT 1 FROM pg_extension WHERE extname = '$EXTENSION'")
    until [ $if_exist -eq 1 ]; do
      echo "Waiting for $EXTENSION to be installed..."
      sleep 1
      if_exist=$(psql "postgresql://postgres:151010@db:5432/template_postgis" \
      -tAc "SELECT 1 FROM pg_extension WHERE extname = '$EXTENSION'")
    done
    echo "$EXTENSION is installed."
}

check_db_extension "postgis_raster" &

# Optionally, you can capture its background job ID
job_id=$!

# If needed, wait for the background job to complete
wait $job_id

# make migrations
echo "Make migrations"
python /app/WebLUCIS/manage.py makemigrations

# Apply database migrations
echo "Apply database migrations"
python /app/WebLUCIS/manage.py migrate

# Run the Python script to load data
echo "Loading data into the database"
python /app/WebLUCIS/load.py
if [ $? -eq 0 ]; then
    echo "Loading data complete"
else
    echo "Failed to load data"
fi

# pass all arguments to the entrypoint script e.g., postgres from init_db.sh
exec "$@"