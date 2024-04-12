from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from .script import *
import json

# from django.http import JsonResponse
from .models import GhanaMmda, SuitabilityTest
from .forms import MmdaForm, BufferForm, SuitabilityTestForm
from .filters import GhanaMmdaFilter


def home(request):
    form = MmdaForm()
    form_buffer = BufferForm()
    suitability_form = SuitabilityTestForm()
    context = {"title": "Map", "is_map": True, "form": form, "form_buffer": form_buffer, "suitability_form":suitability_form}
    return render(request, "home.html", context)


# def buffer(request):
#     form_buffer = BufferForm()
#     return render(request, "partials/buffer_form.html", {"form_buffer": form_buffer})


# def mmdas(request):
#     form = MmdaForm()
#     # regions = GhanaMmda.objects.values('region').distinct() # noqa
#     # regions = {k+1: v['region'] for k, v in enumerate(regions)}
#     context = {"form": form}
#     return render(request, "partials/control_panel.html", context)


def load_districts(request):
    region = request.GET.get("region")
    districts = GhanaMmda.objects.filter(region=region)
    context = {"districts": districts}
    return render(request, "partials/load_districts.html", context)

def submit(request):
    print("submit test working!!!!")
    form = MmdaForm()
    form_buffer = BufferForm()
    context = {"title": "Map", "is_map": True, "form": form, "form_buffer": form_buffer}
    return render(request, "home.html", context) 


def submit_form(request):
    # Access form data
    region = request.POST.get('region')
    district = request.POST.get('district')
    distance = request.POST.get('distance')
    unit = request.POST.get('unit')

    # Do something with the data, call your script, etc.
    gdf = read_data(district)
    buffer_gdf = data_buffer(gdf, distance, unit)
    # Return a response
    return JsonResponse({'result': buffer_gdf.to_json()})

def fetch_suitability(request):
    suitabilityvalue = request.POST.get('suitabilityvalue')
    filtered_data = fetch_data(suitabilityvalue)
    print(filtered_data)
    # Return a response
    return JsonResponse({'result': filtered_data.to_crs(epsg=4326).to_json()})