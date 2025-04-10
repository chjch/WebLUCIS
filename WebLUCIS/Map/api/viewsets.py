from django.shortcuts import get_object_or_404
from django.db import connections
from rest_framework import viewsets
# from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from ..models import GhanaMmda
from django.contrib.gis.db.models.functions import AsGeoJSON
from ..models import GhanaMmda, VectorTest, SuitabilityTest
from .serializers import GhanaMmdaSerializer, BufferDistrictSerializer, SuitabilitySerializer,create_study_area_serializer
from ..filters import GhanaMmdaFilter
from rest_framework.decorators import action
from django.core.exceptions import FieldError


# class ListMmdas(APIView):
#     def get(self, request, format=None):
#         mmdas = Gh260Mmda.objects.all()  # noqa
#         serializer = GhanaMmdaSerializer(mmdas, many=True)
#         return Response(serializer.data)
#
#     def post(self, request, format=None):
#         serializer = GhanaMmdaSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['GET', 'POST'])
# def mmda_list(request, format=None):
#     if request.method == 'GET':
#         mmdas = Gh260Mmda.objects.all()  # noqa
#         serializer = GhanaMmdaSerializer(mmdas, many=True)
#         return Response({"mmdas": serializer.data})
#     elif request.method == 'POST':
#         serializer = GhanaMmdaSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)


# class MmdaDetail(APIView):
#     def get_object(self, pk):
#         try:
#             return Gh260Mmda.objects.get(pk=pk)  # noqa
#         except Gh260Mmda.DoesNotExist:  # noqa
#             return Response(status=status.HTTP_404_NOT_FOUND)
#
#     def get(self, request, pk, format=None):
#         mmda = self.get_object(pk)
#         serializer = GhanaMmdaSerializer(mmda)
#         return Response(serializer.data)
#
#     def put(self, request, pk, format=None):
#         mmda = self.get_object(pk)
#         serializer = GhanaMmdaSerializer(mmda, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#     def delete(self, request, pk, format=None):
#         mmda = self.get_object(pk)
#         mmda.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


class MmdaViewSet(viewsets.ViewSet):
    # filter_backends = (DjangoFilterBackend,)
    filterset_class = GhanaMmdaFilter

    def list(self, request):
        queryset = GhanaMmda.objects.all()  # noqa
        serializer = GhanaMmdaSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None, format=None):
        queryset = GhanaMmda.objects.all()  # noqa
        user = get_object_or_404(queryset, pk=pk)
        serializer = GhanaMmdaSerializer(user)
        return Response(serializer.data)


class BufferViewSet(viewsets.ViewSet):
    filter_class = VectorTest

    def list(self, request):
        queryset = VectorTest.objects.all()
        buffer_feature = queryset.first()
        serializer = BufferDistrictSerializer(buffer_feature)
        return Response(serializer.data)

    def retrieve(self, request, pk=None, format=None):
        queryset = VectorTest.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        serializer = BufferDistrictSerializer(user)
        return Response(serializer.data)

class SuitabilityViewSet(viewsets.ViewSet):
    filter_class = SuitabilityTest

    @action(detail=False, methods=['get'], url_path=r'(?P<suitabilityvalue>\w+)')
    def list_by_suitability(self, request, suitabilityvalue=None):
        if not suitabilityvalue:
            return Response({"error": "suitabilityvalue parameter is required"}, status=400)

        queryset = SuitabilityTest.objects.all()
        geojson_data = queryset.annotate(geomm=AsGeoJSON("geom")).values(suitabilityvalue, 'geomm')
        return Response(geojson_data)

    def retrieve(self, request, pk=None, format=None):
        queryset = SuitabilityTest.objects.all()
        user = get_object_or_404(queryset, pk=pk)
        geojson_data = queryset.filter(pk=pk).annotate(geomm=AsGeoJSON("geom")).values('suitabilityvalue', 'geomm').first()
        return Response(geojson_data)
class MmdaDataDynamicViewSet(viewsets.ViewSet):
    def list(self, request):
        try:
            # Connect to the output database to fetch the list of tables
            with connections['output_db'].cursor() as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables
                    WHERE table_schema = 'public';
                """)
                tables = cursor.fetchall()
            
            # Extract table names
            table_names = [table[0] for table in tables]

            return Response({'available_tables': table_names})
        
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
    def retrieve(self, request, pk=None):
        table_name = pk
        try:
            # Connect to the output database
            with connections['output_db'].cursor() as cursor:
                # Check if the table exists in the output database
                cursor.execute(f"""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    );
                """, [table_name])
                table_exists = cursor.fetchone()[0]

                if not table_exists:
                    return Response({'error': 'Table not found'}, status=404)

                # Fetch all data from the specified table
                cursor.execute(f'SELECT * FROM "{table_name}"')
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

            # Convert rows to JSON-like structure
            raw_data = [dict(zip(columns, row)) for row in rows]

            # Dynamically create a serializer
            DynamicSerializer = create_study_area_serializer(table_name)

            # Serialize the data
            serializer = DynamicSerializer(data=raw_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=400)

        except Exception as e:
            return Response({'error': str(e)}, status=500)