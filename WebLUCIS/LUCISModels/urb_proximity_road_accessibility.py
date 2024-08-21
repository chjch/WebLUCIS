import geopandas as gpd
from sqlalchemy import create_engine
from pylusat import distance, rescale

db_url = "postgresql://postgres:151010@db:5432/template_postgis"


def distance_to_road(input_gdf, road_class, cell_size, method, rescale_min, rescale_max):
    db_connect = create_engine(db_url)
    if road_class == 'primary and secondary':
        road_sql = 'SELECT * FROM ghanaroads'
    else:
        road_sql = f"SELECT * FROM ghanaroads WHERE fclass = '{road_class}'"  # Drop down list
    road_gdf = gpd.read_postgis(sql=road_sql, con=db_connect)

    try:
        distance_output = distance.to_line(
            input_gdf=input_gdf,  # Selected ghana district or other sub-model result gdf
            line_gdf=road_gdf,
            cellsize=int(cell_size),  # Enter by user - Float number box (default 30)
            method=method  # Select by user (optional) - Drop down list
        )
        input_gdf['distance_road'] = distance_output
        rescale_output = rescale.linear(
            input_df=input_gdf,
            input_col='distance_road',
            output_col='distance_road_rescale',
            start=distance_output.max(),
            end=distance_output.min(),
            output_min=int(rescale_min),  # Enter by user (optional) - Float number box
            output_max=int(rescale_max)  # Enter by user (optional) - Float number box
        )
        rescale_output['distance_road_rescale'] = rescale_output['distance_road_rescale'].fillna(int(rescale_min))
        rescale_output_reproject = rescale_output.to_crs(epsg=4326)
        return rescale_output_reproject

    except Exception as e:
        print(e)
        return None
