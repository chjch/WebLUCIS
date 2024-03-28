from django.contrib.gis import admin
from .models import GhanaMmda, VectorTest, SuitabilityTest

# Register your models here.
admin.site.register(GhanaMmda, admin.GISModelAdmin)
admin.site.register(VectorTest, admin.GISModelAdmin)
admin.site.register(SuitabilityTest, admin.GISModelAdmin)
