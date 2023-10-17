from django.contrib.gis.db import models


class GhanaMmda(models.Model):
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    district_c = models.CharField(max_length=50)

    # GeoDjango-specific: a geometry field (PolygonField)
    geom = models.MultiPolygonField()

    def __str__(self):
        return self.district
