import inspect
import geopandas as gpd
from sqlalchemy import create_engine


def CON3O31(study_gdf):
    input_db_engine = create_engine("postgresql://postgres:151010@db:5432/template_postgis")
    wet_sql = 'SELECT * FROM ghanawetlands'
    wet_gdf = gpd.read_postgis(sql=wet_sql, con=input_db_engine)

    try:
        wet_overlap = gpd.sjoin(left_df=study_gdf, right_df=wet_gdf, how='inner', predicate='intersects', rsuffix='wl')
        wet_overlap = wet_overlap.drop_duplicates(subset='geom')
        result_col_name = inspect.currentframe().f_code.co_name
        study_gdf[result_col_name] = 0
        study_gdf.loc[study_gdf['mgrs'].isin(wet_overlap.mgrs), result_col_name] = 1

        result_reproject = study_gdf.to_crs(epsg=4326)
        return result_reproject

    except Exception as e:
        print(e)
        return None