from rest_framework_gis.serializers import GeoFeatureModelSerializer
from django.db import connections
from ..models import GhanaMmda


class GhanaMmdaSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = GhanaMmda
        geo_field = 'geom'
        fields = ('gid', 'region', 'district', 'district_c')


def create_study_area_serializer(table_name):
    """
    Dynamically generate a GeoFeatureModelSerializer for the specified table.
    """
    from django.contrib.gis.db import models

    # Define the constant fields (e.g., gid_mmda, geom) explicitly
    constant_fields = {
        "gid_left": models.BigIntegerField(),
        "gid_mmda": models.BigIntegerField(),
        "region": models.CharField(max_length=50),
        "district": models.CharField(max_length=255),
        "district_c": models.CharField(max_length=50),
        "geom": models.MultiPolygonField(srid=4326),
    }

    # Fetch other fields dynamically from the database
    with connections['output_db'].cursor() as cursor:
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s;
        """, [table_name])
        columns = cursor.fetchall()

    # Dynamically add all fetched columns to the model (avoiding duplicates with constant fields)
    dynamic_fields = {
        column[0]: models.FloatField(null=True) for column in columns if column[0] not in constant_fields
    }

    # Combine constant fields and dynamic fields
    model_fields = {**constant_fields, **dynamic_fields}

    # Create a dynamic model
    DynamicModel = type(
        'DynamicModel',
        (models.Model,),
        {
            '__module__': __name__,
            'Meta': type('Meta', (), {
                'db_table': table_name,
                'managed': False  # Avoid migrations for this dynamic model
            }),
            **model_fields,
        }
    )

    # Define the dynamic serializer class
    class DynamicSerializer(GeoFeatureModelSerializer):
        class Meta:
            model = DynamicModel
            geo_field = 'geom'  # Specify the geometry field
            fields = list(model_fields.keys())  # Include all fields dynamically

    return DynamicSerializer