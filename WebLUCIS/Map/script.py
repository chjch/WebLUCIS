import geopandas as gpd
from sqlalchemy import create_engine

db_url = "postgresql://postgres:151010@db:5432/template_postgis"


# Select study area 1km MGRS
def select_study_area(region, district_id):
    db_connect = create_engine(db_url)
    region_sql = f"SELECT * FROM ghanammda WHERE region = '{region}'"
    region_gdf = gpd.read_postgis(sql=region_sql, con=db_connect)
    mgrs_sql = 'SELECT * FROM ghanamgrs'
    mgrs_gdf = gpd.read_postgis(sql=mgrs_sql, con=db_connect)
    region_mgrs_gdf = gpd.sjoin(mgrs_gdf, region_gdf, how='inner', predicate='intersects', rsuffix='mmda')
    if district_id == "All Districts":
        district_mgrs_gdf = region_mgrs_gdf
    else:
        district_mgrs_gdf = region_mgrs_gdf.loc[region_mgrs_gdf['gid_mmda'] == int(district_id), :]
    return district_mgrs_gdf


# Buffer test for Ghana selected district
def data_buffer(gdf, distance, unit):
    if int(unit) == 2:
        gdf_buffer = gdf.buffer(float(distance)*1609.34)
        return gdf_buffer.to_crs(epsg=4326)
    elif int(unit) == 3:
        gdf_buffer = gdf.buffer(float(distance)*1000)
        return gdf_buffer.to_crs(epsg=4326)
    else:
        raise ValueError('The unit is not defined.')


def fetch_data(suitabilityvalue):
    query = f'SELECT {suitabilityvalue},"geom" FROM "Map_suitabilitytest" '
    # Execute the query and fetch data, assuming db_fetch_data is a method to execute SQL queries and return results
    db_connect = create_engine(db_url)
    return gpd.read_postgis(sql=query, con=db_connect)

