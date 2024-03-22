import geopandas as gpd
from sqlalchemy import create_engine


db_url = "postgresql://postgres:151010@db:5432/template_postgis"


def read_data(district_id):
    sql = f'SELECT * FROM "Map_ghanammda" WHERE id={district_id}'
    db_connect = create_engine(db_url)
    return gpd.read_postgis(sql=sql, con=db_connect)


def data_buffer(gdf, distance, unit):
    gdf_project = gdf.to_crs(epsg=32630)

    if int(unit) == 2:
        buffer_distance = float(distance)*1609.34
    elif int(unit) == 3:
        buffer_distance = float(distance)*1000
    else:
        return 'The distance unit is not define.'

    gdf_project['buffer_geometry'] = gdf_project.buffer(buffer_distance)
    gdf_buffer = gdf_project.loc[:, ['buffer_geometry']]

    for column in gdf.columns:
        if column != 'geom':
            gdf_buffer[column] = gdf_project[column]

    gdf_buffer = gdf_buffer[[col for col in gdf_buffer.columns if col != 'buffer_geometry'] + ['buffer_geometry']]
    gdf_buffer = gdf_buffer.rename(columns={'buffer_geometry': 'geom'})
    # gdf_buffer['id'] = gdf_buffer.id + 260
    gdf_buffer = gpd.GeoDataFrame(gdf_buffer, geometry='geom', crs=gdf_project.crs)
    gdf_buffer = gdf_buffer.to_crs(epsg=4326)
    print(gdf_buffer)
    db_engine = create_engine(db_url)
    gdf_postgis = gdf_buffer.to_postgis('Map_vectortest', db_engine, if_exists='replace')
    return gdf_postgis
