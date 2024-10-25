from django.db import connection
from rasterio.io import MemoryFile
from pylusat import zonal, rescale


def popdens_zonal_statistics(zonal_gdf, stats_type, rescale_min, rescale_max):
    popdens_raster_sql = f'SELECT ST_AsGDALRaster(ghanapopdens.rast, \'GTiff\') AS my_raster FROM "ghanapopdens" LIMIT 1;'

    try:
        with connection.cursor() as cursor:
            cursor.execute(popdens_raster_sql)
            for row in cursor:
                db_popdens_raster = row[0].tobytes()
                rasterio_popdens_raster = MemoryFile(db_popdens_raster)
                zonal_output = zonal.zonal_stats_raster(
                    zone_gdf=zonal_gdf,
                    raster=rasterio_popdens_raster,  # Hard code using ghanapopdens raster data
                    stats=stats_type,  # Enter by user - Drop down list
                    stats_prefix='PopDens',
                    nodata=None
                )
                rescale_output = rescale.linear(
                    input_df=zonal_output,
                    input_col=f'PopDens_{stats_type}',
                    output_col='zonal_popdens_rescale',
                    start=zonal_output[f'PopDens_{stats_type}'].max(),
                    end=zonal_output[f'PopDens_{stats_type}'].min(),
                    output_min=int(rescale_min),
                    output_max=int(rescale_max)
                )
                rescale_output['zonal_popdens_rescale'] = rescale_output['zonal_popdens_rescale'].fillna(int(rescale_min))
                rescale_output_reproject = rescale_output.to_crs(epsg=4326)
        return rescale_output_reproject

    except Exception as e:
        print(e)
        return None