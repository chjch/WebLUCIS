from django.shortcuts import get_object_or_404
from django.db import connections
from rest_framework import viewsets
from rest_framework.response import Response
from ..models import GhanaMmda
from .serializers import GhanaMmdaSerializer
from .serializers import create_study_area_serializer
from ..filters import GhanaMmdaFilter
from rest_framework.decorators import action
from django.core.exceptions import FieldError

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