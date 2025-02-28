from django.contrib.gis.db import models
from django.utils import timezone
from datetime import timedelta


class GhanaMmda(models.Model):
    gid = models.AutoField(primary_key=True)
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    district_c = models.CharField(max_length=254)
    geom = models.MultiPolygonField(srid=3857)

    class Meta:
        managed = False  # Django won't manage the table
        db_table = 'ghanammda'

    def __str__(self):
        return self.district
