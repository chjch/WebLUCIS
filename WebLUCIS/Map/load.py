from pathlib import Path
from django.contrib.gis.utils import LayerMapping
from .models import GhanaMmda

ghanammda_mapping = {
    "region": "REGION",
    "district": "DISTRICT",
    "district_c": "DISTRICT_C",
    "geom": "MULTIPOLYGON",
}

ghanammda_shp = (
    Path(__file__).resolve().parent.parent / "data" / "Gh_260_MMDA_wgs84.shp"
)


def run(verbose=True):
    lm = LayerMapping(
        GhanaMmda, ghanammda_shp, ghanammda_mapping, transform=False
    )
    lm.save(strict=True, verbose=verbose)
