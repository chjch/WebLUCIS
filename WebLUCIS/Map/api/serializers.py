from rest_framework_gis import serializers
from ..models import GhanaMmda, VectorTest


class GhanaMmdaSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = GhanaMmda
        geo_field = 'geom'
        fields = ('id', 'region', 'district', 'district_c')


class BufferDistrictSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = VectorTest
        geo_field = 'geom'
        fields = ('id', 'region', 'district', 'district_c')
