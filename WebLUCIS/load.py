import os
import sys
import django
from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from django.contrib.gis.gdal import GDALRaster

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "WebLUCIS.settings")
django.setup()

import Map.models

ghanammda_mapping = {
    "region": "REGION",
    "district": "DISTRICT",
    "district_c": "DISTRICT_C",
    "geom": "MULTIPOLYGON",
}

ghanamgrs_mapping = {
    "mgrs": "MGRS",
    "geom": "POLYGON",
}

ghanaroads_mapping = {
    "road_class": "fclass",
    "geom": "MULTILINESTRING",
}

suitabilitytest_mapping = {
    'road': 'Rd_mean',
    'road_suit': 'Resc_Rd',
    'pop': 'Pop_mean',
    'pop_suit': 'Resc_Pop',
    'urb': 'Urb',
    'urb_suit': 'Urb_Resc',
    'geom': 'MULTIPOLYGON',
}

ghanammda_shp = (
    Path(__file__).resolve().parent / "data" / "Gh_260_MMDA_wgs84.shp"
)

ghana_pd_tif = (
    Path(__file__).resolve().parent / "data" / "gha_popden_2020_1km_UNadj.tif"
)

ghana_roads_shp = (
    Path(__file__).resolve().parent / "data" / "gis_osm_roads_ghana.shp"
)

ghana_lc_tif = (
    Path(__file__).resolve().parent / "data" / "gha_lc_2019_100m.tif"
)

ghana_bs_tif = (
    Path(__file__).resolve().parent / "data" / "gha_dist_bsgme_100m_2020.tif"
)

ghana_mgrs_shp = (
    Path(__file__).resolve().parent / "data" / "MGRS_Ghana_1km.shp"
)


def load_ghana_districts(verbose=True):
    lm = LayerMapping(
        Map.models.GhanaMmda, ghanammda_shp, ghanammda_mapping, transform=True, source_srs=4326
    )
    lm.save(strict=True, verbose=verbose)


def load_ghana_mgrs(verbose=True):
    lm = LayerMapping(
        Map.models.GhanaMGRS, ghana_mgrs_shp, ghanamgrs_mapping, transform=True, source_srs=3857
    )
    lm.save(strict=True, verbose=verbose)


def load_ghana_pop_density():
    ghana_popdensity = GDALRaster(str(ghana_pd_tif), write=True)
    raster_layer = Map.models.GhanaPopDensity.objects.create(
        raster=ghana_popdensity,
        name='Ghana Population Density 2020 1km'
    )
    raster_layer.save()
    print(f"Successfully loaded Ghana Population Density raster data")


def load_ghana_roads(verbose=True):
    lm = LayerMapping(
        Map.models.GhanaRoads, ghana_roads_shp, ghanaroads_mapping, transform=True
    )
    lm.save(strict=True, verbose=verbose)


def load_ghana_landcover():
    ghana_lc = GDALRaster(str(ghana_lc_tif), write=True)
    raster_layer = Map.models.GhanaLandCover.objects.create(
        raster=ghana_lc,
        name='Ghana Land Cover 2019 100m'
    )
    raster_layer.save()
    print(f"Successfully loaded Ghana Land Cover raster data")


def load_ghana_builtsettlement():
    ghana_bs = GDALRaster(str(ghana_bs_tif), write=True)
    raster_layer = Map.models.GhanaBuiltSettlement.objects.create(
        raster=ghana_bs,
        name='Ghana Built Settlement Distance 2020 100m'
    )
    raster_layer.save()
    print(f"Successfully loaded Ghana Built Settlement Distance raster data")


# def reset_primary_key_sequence(model):
#     table_name = model._meta.db_table
#     reset_sql = f'ALTER SEQUENCE "{table_name}_id_seq" RESTART WITH 1;'
#     with connection.cursor() as cursor:
#         cursor.execute(reset_sql)
#
#
def run_suitability_test(verbose=True):
    # SuitabilityTest.objects.all().delete()
    # reset_primary_key_sequence(SuitabilityTest)
    suitabilitytest_shp = (
        Path(__file__).resolve().parent.parent / "data" / "Urban_Suitability_Final.shp"
    )
    lm = LayerMapping(
        Map.models.SuitabilityTest, suitabilitytest_shp, suitabilitytest_mapping, transform=True
    )
    lm.save(strict=True, verbose=verbose)


if __name__ == "__main__":
    load_ghana_districts()
    load_ghana_mgrs()
    # load_ghana_pop_density()
    # load_ghana_roads()
    # load_ghana_landcover()
    # load_ghana_builtsettlement()

