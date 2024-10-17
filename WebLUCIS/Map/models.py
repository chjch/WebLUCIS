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

class GhanaMGRS(models.Model):
    gid = models.AutoField(primary_key=True)
    mgrs = models.CharField(max_length=50)
    geom = models.PolygonField(srid=3857)

    class Meta:
        managed = False  # Django won't manage the table
        db_table = 'ghanamgrs'

    def __str__(self):
        return self.mgrs

class VectorTest(models.Model):
    region = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    district_c = models.CharField(max_length=50)
    geom = models.MultiPolygonField()

    def __str__(self):
        return self.district
    # created_at = models.DateTimeField(auto_now_add=True)
    # expiry_date = models.DateTimeField(default=timezone.now() + timedelta(days=2))


class SuitabilityTest(models.Model):
    road = models.FloatField()
    road_suit = models.FloatField()
    pop = models.FloatField()
    pop_suit = models.FloatField()
    urb = models.FloatField()
    urb_suit = models.FloatField()
    geom = models.MultiPolygonField(srid=4326)

class GhanaPopDens(models.Model):
    rid = models.AutoField(primary_key=True)
    rast = models.RasterField()
    filename = models.TextField()

    class Meta:
        managed = False  # Django won't manage the table
        db_table = 'ghanapopdens'


class GhanaRoads(models.Model):
    gid = models.AutoField(primary_key=True)
    fclass = models.CharField(max_length=100)
    geom = models.MultiLineStringField(srid=3857)

    class Meta:
        managed = False  # Django won't manage the table
        db_table = 'ghanaroads'

    def __str__(self):
        return self.fclass