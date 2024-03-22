from django.contrib.gis.db import models
from django.utils import timezone
from datetime import timedelta


class GhanaMmda(models.Model):
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    district_c = models.CharField(max_length=50)

    # GeoDjango-specific: a geometry field (PolygonField)
    geom = models.MultiPolygonField()

    def __str__(self):
        return self.district


class VectorTest(models.Model):
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    district_c = models.CharField(max_length=50)
    geom = models.MultiPolygonField()

    def __str__(self):
        return self.district
    # created_at = models.DateTimeField(auto_now_add=True)
    # expiry_date = models.DateTimeField(default=timezone.now() + timedelta(days=2))
