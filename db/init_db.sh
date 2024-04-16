#!/bin/bash
set -e  # stop on error

# Function to ensure PostGIS is installed
# ensure_postgis() {
#   # Wait for PostgreSQL to start
#   until pg_isready -q -h db -U "$POSTGRES_USER"; do
#     echo "Waiting for PostgreSQL to start..."
#     echo "I'm in init_db.sh"
#     sleep 1
#   done

#   # Connect to the PostgreSQL server and install PostGIS if not already installed
#   echo "Installing Extensions..."
#   psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#       CREATE EXTENSION IF NOT EXISTS postgis;
#       CREATE EXTENSION IF NOT EXISTS postgis_topology;
#       CREATE EXTENSION IF NOT EXISTS postgis_raster;
# EOSQL
# }

# Call the function ("&" to run in the background)
# ensure_postgis &

# exec "$@"
# Execute the original entrypoint script to keep container running

sql_extensions=$(cat <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    CREATE EXTENSION IF NOT EXISTS postgis_raster;
EOSQL
)

if [ -f /var/lib/postgresql/data/postmaster.pid ]; then
    echo "Existing postmaster.pid found!"
    if ! pg_isready; then
        echo "PostgreSQL is not running. Removing postmaster.pid."
        rm /var/lib/postgresql/data/postmaster.pid
    else
        echo "PostgreSQL is running. Installing Extensions..."
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "$sql_extensions"
    fi
fi

# exec /usr/local/bin/docker-entrypoint.sh "$@"
# exec docker-entrypoint.sh postgres
# exec postgres -c max_connections=200

# exec gosu postgres postgres -c max_connections=200