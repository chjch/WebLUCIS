from django.contrib.gis.db import models


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


class SuitabilityTest(models.Model):
    road = models.FloatField()
    road_suit = models.FloatField()
    pop = models.FloatField()
    pop_suit = models.FloatField()
    urb = models.FloatField()
    urb_suit = models.FloatField()
    geom = models.MultiPolygonField(srid=4326)


class GhanaPopDensity(models.Model):
    raster = models.RasterField()
    name = models.CharField("Ghana Population Density 2020 1km", max_length=100)

    def __str__(self):
        return self.name
