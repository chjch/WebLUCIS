import inspect
import geopandas as gpd
from sqlalchemy import create_engine
from pylusat import distance, rescale


def URB1O12SO121(input_gdf, road_class, cell_size, method, rescale_min, rescale_max):
    input_db_engine = create_engine("postgresql://postgres:151010@db:5432/template_postgis")

    if road_class == 'primary_secondary':
        road_sql = 'SELECT * FROM ghanaroads'
    else:
        road_sql = f"SELECT * FROM ghanaroads WHERE fclass = '{road_class}'"
    road_gdf = gpd.read_postgis(sql=road_sql, con=input_db_engine)

    try:
        distance_output = distance.to_line(
            input_gdf=input_gdf,
            line_gdf=road_gdf,
            cellsize=int(cell_size),
            method=method
        )
        input_gdf['distance_road'] = distance_output
        result_col_name = inspect.currentframe().f_code.co_name
        rescale_output = rescale.linear(
            input_df=input_gdf,
            input_col='distance_road',
            output_col=result_col_name,
            start=distance_output.max(),
            end=distance_output.min(),
            output_min=int(rescale_min),
            output_max=int(rescale_max)
        )
        rescale_output[result_col_name] = rescale_output[result_col_name].fillna(int(rescale_min)).astype(float)
        rescale_output_reproject = rescale_output.to_crs(epsg=4326)
        return rescale_output_reproject, result_col_name

    except Exception as e:
        print(e)
        return None