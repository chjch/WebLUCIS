from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import GhanaMmda, SuitabilityTest
from django.db import connection

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
    Path(__file__).resolve().parent.parent / "data" / "Gh_260_MMDA_wgs84.shp"
)


def run(verbose=True):
    lm = LayerMapping(
        GhanaMmda, ghanammda_shp, ghanammda_mapping, transform=False
    )
    lm.save(strict=True, verbose=verbose)


def reset_primary_key_sequence(model):
    table_name = model._meta.db_table
    reset_sql = f'ALTER SEQUENCE "{table_name}_id_seq" RESTART WITH 1;'
    with connection.cursor() as cursor:
        cursor.execute(reset_sql)


def run_suitability_test(verbose=True):
    SuitabilityTest.objects.all().delete()
    reset_primary_key_sequence(SuitabilityTest)
    suitabilitytest_shp = (
        Path(__file__).resolve().parent.parent / "data" / "Urban_Suitability_Final.shp"
    )
    lm = LayerMapping(
        SuitabilityTest, suitabilitytest_shp, suitabilitytest_mapping, transform=True
    )
    lm.save(strict=True, verbose=verbose)
