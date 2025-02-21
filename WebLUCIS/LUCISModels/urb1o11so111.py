import inspect
from django.db import connection
from rasterio.io import MemoryFile
from pylusat import zonal, rescale


def URB1O11SO111(zonal_gdf, stats_type, reclassify_dict):
    raster_sql = f'SELECT ST_AsGDALRaster(ghanalc.rast, \'GTiff\') AS my_raster FROM "ghanalc" LIMIT 1;'

    try:
        with connection.cursor() as cursor:
            cursor.execute(raster_sql)
            for row in cursor:
                db_raster = row[0].tobytes()
                rasterio_raster = MemoryFile(db_raster)
                zonal_output = zonal.zonal_stats_raster(
                    zone_gdf=zonal_gdf,
                    raster=rasterio_raster,
                    stats=stats_type,
                    stats_prefix='LC',
                    nodata=None
                )

                result_col_name = inspect.currentframe().f_code.co_name

                reclassify_output = rescale.reclassify(
                    input_df=zonal_output,
                    input_col=f'LC_{stats_type}',
                    reclassify_def=reclassify_dict,
                    output_col=result_col_name,
                    nodata=0
                )
                reclassify_output[result_col_name] = reclassify_output[result_col_name].fillna(1).astype(float)
                reclassify_output_reproject = reclassify_output.to_crs(epsg=4326)
        return reclassify_output_reproject, result_col_name

    except Exception as e:
        print(e)
        return None