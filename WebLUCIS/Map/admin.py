from django.contrib.gis import admin
from .models import GhanaMmda, SuitabilityTest, GhanaPopDens


# Register your models here.
admin.site.register(GhanaMmda, admin.GISModelAdmin)
admin.site.register(SuitabilityTest)
admin.site.register(GhanaPopDens)
