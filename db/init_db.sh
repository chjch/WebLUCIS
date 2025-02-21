#!/bin/bash
set -e  # stop on error

# Ensure the user has a password set
psql -U $POSTGRES_USER -d postgres -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"

# Allow all hosts to connect for development purposes (adjust for production!)
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host all all ::/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

# Listen on all interfaces
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /var/lib/postgresql/data/postgresql.conf

# Check if the database exists; if not, create it
psql -U $POSTGRES_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
    psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB;"

# The sql of create necessary extension for database
sql_extensions=$(cat <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS postgis_topology;
    CREATE EXTENSION IF NOT EXISTS postgis_raster;
    ALTER DATABASE template_postgis SET postgis.gdal_enabled_drivers TO 'ENABLE_ALL';
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

# Function to load shapefiles using shp2pgsql with SRID projection
load_shapefiles() {
  for file in /data/*.shp; do
    base=$(basename "$file" .shp)
    echo "Loading shapefile: ${base}.shp"
    shp2pgsql -s 3857 "/data/${base}.shp" public."${base}" | psql -U $POSTGRES_USER -d $POSTGRES_DB
  done
}

# Function to load rasters using raster2pgsql
load_rasters() {
  for file in /data/*.tif; do
    base=$(basename "$file" .tif)
    echo "Loading raster: ${base}.tif"
    raster2pgsql -C -I -M -F "$file" public."${base}" | psql -U $POSTGRES_USER -d $POSTGRES_DB
  done
}

# Load shapefiles and rasters
load_shapefiles
load_rasters

echo "Database initialization and data loading complete."