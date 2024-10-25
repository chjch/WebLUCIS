from rest_framework_gis import serializers
from ..models import GhanaMmda, VectorTest, SuitabilityTest


class GhanaMmdaSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = GhanaMmda
        geo_field = 'geom'
        fields = ('gid', 'region', 'district', 'district_c')


class BufferDistrictSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = VectorTest
        geo_field = 'geom'
        fields = ('gid', 'region', 'district', 'district_c')

class SuitabilitySerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = SuitabilityTest
        geo_field = 'geom'
        fields = ('id', 'road', 'road_suit', 'pop','pop_suit','urb','urb_suit')