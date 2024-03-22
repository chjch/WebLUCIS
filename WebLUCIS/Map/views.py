import json
from django.shortcuts import render
from django.http import JsonResponse
from .script import *

# from django.http import JsonResponse
from .models import GhanaMmda
from .forms import MmdaForm, BufferForm, PopulationDensityForm, ReclassifyTable
from .filters import GhanaMmdaFilter


def home(request):
    form = MmdaForm()
    form_buffer = BufferForm()
    form_new = PopulationDensityForm()
    form_reclass = ReclassifyTable()
    context = {
        "title": "Map",
        "is_map": True,
        "form": form,
        "form_buffer": form_buffer,
        "form_new": form_new,
        "form_reclass": form_reclass
    }
    return render(request, "home.html", context)


def load_districts(request):
    region = request.GET.get("region")
    districts = GhanaMmda.objects.filter(region=region)
    context = {"districts": districts}
    return render(request, "partials/load_districts.html", context)


def submit_form(request):
    # Access form data
    region = request.POST.get('region')
    district = request.POST.get('district')
    distance = request.POST.get('distance')
    unit = request.POST.get('unit')

    # Do something with the data, call your script, etc.
    gdf = read_data(district)
    print(gdf)
    buffer_postgis = data_buffer(gdf, distance, unit)
    # Return a response
    return JsonResponse({'result': buffer_postgis})

