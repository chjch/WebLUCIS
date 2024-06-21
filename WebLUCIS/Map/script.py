import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine
from django.db import connection
from rasterio.io import MemoryFile
from pylusat import zonal

db_url = "postgresql://postgres:151010@db:5432/template_postgis"


# Buffer test for Ghana selected district
def read_data(district_id):
    sql = f'SELECT * FROM "Map_ghanammda" WHERE id={district_id}'
    db_connect = create_engine(db_url)
    return gpd.read_postgis(sql=sql, con=db_connect)


def data_buffer(gdf, distance, unit):
    gdf_project = gdf.to_crs(epsg=32630)

    if int(unit) == 2:
        gdf_buffer = gdf_project.buffer(float(distance)*1609.34)
        return gdf_buffer.to_crs(epsg=4326)
    elif int(unit) == 3:
        gdf_buffer = gdf_project.buffer(float(distance)*1000)
        return gdf_buffer.to_crs(epsg=4326)
    else:
        return 'The unit is not define.'


def fetch_data(suitabilityvalue):
    query = f'SELECT {suitabilityvalue},"geom" FROM "Map_suitabilitytest" '
    # Execute the query and fetch data, assuming db_fetch_data is a method to execute SQL queries and return results
    db_connect = create_engine(db_url)
    return gpd.read_postgis(sql=query, con=db_connect)


# Zonal statistic using raster data from postgis database
def raster_zonal_statistics(table_name, zonal_gdf):
    raster_sql = f'SELECT ST_AsGDALRaster(raster, \'GTiff\') AS my_raster FROM "{table_name}" LIMIT 1;'
    try:
        with connection.cursor() as cursor:
            cursor.execute(raster_sql)
            for row in cursor:
                db_raster = row[0].tobytes()
                rasterio_raster = MemoryFile(db_raster)
                zonal_output = zonal.zonal_stats_raster(zonal_gdf, rasterio_raster)
        return zonal_output

    except Exception as e:
        print(e)
        return None


def reclassify_column(gdf, reclassify_field, reclassify_dict, output_name, nodata=None):
    reclassified_values = []
    end_val_max = max(reclassify_dict.keys(), key=lambda x: x[1])[1]

    for value in gdf[reclassify_field]:
        if pd.isna(value):
            reclassified_values.append(nodata)
        else:
            reclassified = nodata
            for (start_val, end_val), new_val in reclassify_dict.items():
                if start_val <= value < end_val or (value == end_val and value == end_val_max):
                    reclassified = new_val
                    break
            reclassified_values.append(reclassified)

    gdf[output_name] = reclassified_values
    return gdf
