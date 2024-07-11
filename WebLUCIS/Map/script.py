import geopandas as gpd
from sqlalchemy import create_engine

db_url = "postgresql://postgres:151010@db:5432/template_postgis"


# Select analysis district
def select_district(district_id):
    district_sql = f'SELECT * FROM "Map_ghanammda" WHERE id={district_id}'
    db_connect = create_engine(db_url)
    district_gdf = gpd.read_postgis(sql=district_sql, con=db_connect)
    district_reproject = district_gdf.to_crs(epsg=3857)  # Later move projection setting into models geom(srid=3857)
    return district_reproject


# Buffer test for Ghana selected district
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

