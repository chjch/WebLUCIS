import django_filters
from rest_framework_gis.filters import GeoFilterSet
from .models import GhanaMmda


class GhanaMmdaFilter(django_filters.FilterSet):
    class Meta:
        model = GhanaMmda
        fields = {
            'id': ['exact'],  # 'in', 'range', 'gt', 'gte', 'lt', 'lte', 'exact
            'region': ['exact'],
            'district': ['exact'],
        }
