import geopandas as gpd
from sqlalchemy import create_engine
from pylusat import distance, rescale

db_url = "postgresql://postgres:151010@db:5432/template_postgis"


def distance_to_road(input_gdf, road_class, cell_size=30, method='euclidean', rescale_min=1, rescale_max=9):
    db_connect = create_engine(db_url)
    if road_class == 'primary and secondary':
        road_sql = 'SELECT * FROM "Map_ghanaroads"'
    else:
        road_sql = f'SELECT * FROM "Map_ghanaroads" WHERE road_class = \'{road_class}\''  # Drop down list
    road_gdf = gpd.read_postgis(sql=road_sql, con=db_connect)

    try:
        distance_output = distance.to_line(
            input_gdf=input_gdf,  # Selected ghana district or other sub-model result gdf
            line_gdf=road_gdf,
            cellsize=cell_size,  # Enter by user - Float number box (default 30)
            method=method  # Select by user (optional) - Drop down list
        )
        input_gdf['distance_road'] = distance_output
        rescale_output = rescale.linear(
            input_df=input_gdf,
            input_col='distance_road',
            output_col='distance_road_rescale',
            start=distance_output.max(),
            end=distance_output.min(),
            output_min=rescale_min,  # Enter by user (optional) - Float number box
            output_max=rescale_max  # Enter by user (optional) - Float number box
        )
        rescale_output['distance_road_rescale'] = rescale_output['distance_road_rescale'].fillna(rescale_min)
        return rescale_output

    except Exception as e:
        print(e)
        return None
