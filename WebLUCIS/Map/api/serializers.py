from rest_framework_gis import serializers
from ..models import GhanaMmda


class GhanaMmdaSerializer(serializers.GeoFeatureModelSerializer):
    class Meta:
        model = GhanaMmda
        geo_field = 'geom'
        fields = ('id', 'region', 'district', 'district_c')
