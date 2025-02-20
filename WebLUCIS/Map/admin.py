from django.contrib.gis import admin
from .models import GhanaMmda


# Register your models here.
admin.site.register(GhanaMmda, admin.GISModelAdmin)
