from django.shortcuts import render
from django.http import JsonResponse
from .script import *

# from django.http import JsonResponse
from .models import GhanaMmda
from .forms import MmdaForm, BufferForm, SuitabilityTestForm


def home(request):
    form = MmdaForm()
    form_buffer = BufferForm()
    suitability_form = SuitabilityTestForm()
    context = {"title": "Map", "is_map": True, "form": form, "form_buffer": form_buffer, "suitability_form":suitability_form}
    return render(request, "home.html", context)


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
    district_id = request.POST.get('district')
    distance = request.POST.get('distance')
    unit = request.POST.get('unit')

    # Do something with the data, call your script, etc.
    study_gdf = select_study_area(region, district_id)
    buffer_study_gdf = data_buffer(study_gdf, distance, unit)
    # Return a response
    return JsonResponse({'result': buffer_study_gdf.to_json()})


def fetch_suitability(request):
    suitabilityvalue = request.POST.get('suitabilityvalue')
    filtered_data = fetch_data(suitabilityvalue)
    print(filtered_data)
    # Return a response
    return JsonResponse({'result': filtered_data.to_crs(epsg=4326).to_json()})
