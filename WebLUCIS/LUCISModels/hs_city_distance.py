from django.db import connection
from rasterio.io import MemoryFile
from pylusat import zonal, rescale


def city_zonal_statistics(zonal_gdf, stats_type, rescale_min, rescale_max):
    raster_sql = f'SELECT ST_AsGDALRaster(ghanabs.rast, \'GTiff\') AS my_raster FROM "ghanabs" LIMIT 1;'

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
                    stats_prefix='DistC',
                    nodata=None
                )
                rescale_output = rescale.linear(
                    input_df=zonal_output,
                    input_col=f'DistC_{stats_type}',
                    output_col='distance_city_rescale',
                    start=zonal_output[f'DistC_{stats_type}'].max(),
                    end=zonal_output[f'DistC_{stats_type}'].min(),
                    output_min=int(rescale_min),
                    output_max=int(rescale_max)
                )
                rescale_output['distance_city_rescale'] = (
                    rescale_output['distance_city_rescale']
                    .fillna(int(rescale_min))
                )
                rescale_output_reproject = rescale_output.to_crs(epsg=4326)
        return rescale_output_reproject

    except Exception as e:
        print(e)
        return None