from django.contrib.gis import admin
from .models import GhanaMmda, GhanaPopDens


# Register your models here.
admin.site.register(GhanaMmda, admin.GISModelAdmin)
admin.site.register(GhanaPopDens)
