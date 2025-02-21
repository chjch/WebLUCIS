import inspect
import geopandas as gpd
from sqlalchemy import create_engine


def CON5O53SO532(study_gdf):
    input_db_engine = create_engine("postgresql://postgres:151010@db:5432/template_postgis")
    fr_sql = 'SELECT * FROM ghanaoecm WHERE type = \'Forest Reserve\''
    fr_gdf = gpd.read_postgis(sql=fr_sql, con=input_db_engine)

    try:
        fr_overlap = gpd.sjoin(left_df=study_gdf, right_df=fr_gdf, how='inner', predicate='intersects', rsuffix='fr')
        fr_overlap = fr_overlap.drop_duplicates(subset='geom')
        result_col_name = inspect.currentframe().f_code.co_name
        study_gdf[result_col_name] = 0
        study_gdf.loc[study_gdf['mgrs'].isin(fr_overlap.mgrs), result_col_name] = 0.7

        result_reproject = study_gdf.to_crs(epsg=4326)
        return result_reproject

    except Exception as e:
        print(e)
        return None