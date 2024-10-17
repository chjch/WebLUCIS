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

from Map.models import GhanaMmda, GhanaPopDensity, SuitabilityTest

ghanammda_mapping = {
    "region": "REGION",
    "district": "DISTRICT",
    "district_c": "DISTRICT_C",
    "geom": "MULTIPOLYGON",
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


def load_ghana_districts(verbose=True):
    lm = LayerMapping(
        GhanaMmda, ghanammda_shp, ghanammda_mapping, transform=False
    )
    lm.save(strict=True, verbose=verbose)


def load_ghana_pop_density():
    ghana_popdensity = GDALRaster(str(ghana_pd_tif), write=True)
    raster_layer = GhanaPopDensity.objects.create(
        raster=ghana_popdensity,
        name='Ghana Population Density 2020 1km'
    )
    raster_layer.save()
    print(f"Successfully loaded raster data with ID {raster_layer.pk}")


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
        SuitabilityTest, suitabilitytest_shp, suitabilitytest_mapping, transform=True
    )
    lm.save(strict=True, verbose=verbose)


if __name__ == "__main__":
    load_ghana_districts()
    load_ghana_pop_density()

