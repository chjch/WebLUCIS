from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import GhanaMmda, SuitabilityTest

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


def run_suitability_test(verbose=True):
    suitabilitytest_shp = (
        Path(__file__).resolve().parent.parent / "data" / "Urban_Suitability_Final.shp"
    )
    lm = LayerMapping(
        SuitabilityTest, suitabilitytest_shp, suitabilitytest_mapping, transform=False
    )
    lm.save(strict=True, verbose=verbose)

