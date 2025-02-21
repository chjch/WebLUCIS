import inspect
import geopandas as gpd
from sqlalchemy import create_engine


def CON3O33(study_gdf, buffer_distance):
    input_db_engine = create_engine("postgresql://postgres:151010@db:5432/template_postgis")
    open_water_sql = 'SELECT * FROM ghanawater'
    open_water_gdf = gpd.read_postgis(sql=open_water_sql, con=input_db_engine)

    try:
        open_water_gdf['geom'] = open_water_gdf.buffer(
            distance=float(buffer_distance),
            resolution=1, 
            cap_style='round', 
            join_style='round', 
            mitre_limit=2.0
        )
        
        open_water_overlap = gpd.sjoin(left_df=study_gdf, right_df=open_water_gdf, how='inner', predicate='intersects', rsuffix='ow')
        open_water_overlap = open_water_overlap.drop_duplicates(subset='geom')
        result_col_name = inspect.currentframe().f_code.co_name
        study_gdf[result_col_name] = 0
        study_gdf.loc[study_gdf['mgrs'].isin(open_water_overlap.mgrs), result_col_name] = 1

        result_reproject = study_gdf.to_crs(epsg=4326)
        return result_reproject

    except Exception as e:
        print(e)
        return None