from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_POST
from django.contrib.gis.db.models.functions import AsGeoJSON
from .script import *
import json
from LUCISModels.urb_proximity_road_accessibility import distance_to_road
from LUCISModels.urb_proximity_road_accessibility import save_to_output_db
from LUCISModels.hs_pop_density import popdens_zonal_statistics
from LUCISModels import hs_city_distance as hs_cd

# from django.http import JsonResponse
from .models import GhanaMmda, SuitabilityTest
# from .forms import MmdaForm, BufferForm, SuitabilityTestForm
from .forms import * 
from .filters import GhanaMmdaFilter
from django.core.serializers import serialize

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
    all_districts = [{'gid': '0', 'district': 'All Districts'}] + [{'gid': d.gid, 'district': d.district} for d in districts]

    context = {'districts': all_districts}
    return render(request, "partials/load_districts.html", context)

def submit(request):
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
    gdf = select_study_area(region,district)
    buffer_gdf = data_buffer(gdf, distance, unit)
    # Return a response
    return JsonResponse({'result': buffer_gdf.to_json()})

def submit_road_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    road_class = request.POST.get('road_class')
    cell_size = request.POST.get('cell_size')
    method = request.POST.get('method')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region, district_id)
    dist_road = distance_to_road(study_gdf, road_class, cell_size, method, rescale_min, rescale_max)
    # json = dist_road.to_json()
    save_to_output_db(dist_road, 'distance_road_rescale')
    print(dist_road)
    print("ooslsl")
    print(dist_road.to_json())
    return JsonResponse({'result': dist_road.to_json()})
def submit_landusage_form(request):
    # print(request.POST)
    start_values = request.POST.getlist('start')
    end_values = request.POST.getlist('end')
    new_values = request.POST.getlist('new_value')
    stats_type = request.POST.get('stats_type')  # Get selected aggregation method
    print(stats_type)
    values = {}
    for i in range(len(start_values)):
        if start_values[i]!='' and end_values[i]!='' and new_values[i]!='':
            values[new_values[i]] = [start_values[i], end_values[i], new_values[i]]   
    print(values)
    return JsonResponse({'result': 'land usage form'})
def submit_popdensity_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    stats_type = request.POST.get('stats_type')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region, district_id)
    pop_density = popdens_zonal_statistics(study_gdf, stats_type, rescale_min, rescale_max)

    return JsonResponse({'result': pop_density.to_json()})

def submit_citydist_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    stats_type = request.POST.get('stats_type')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region,   )
    city_dist = hs_cd.city_zonal_statistics(study_gdf, stats_type, rescale_min, rescale_max)
 
    return JsonResponse({'result': city_dist.to_json()})

def fetch_suitability(request):
    suitabilityvalue = request.POST.get('suitabilityvalue')
    # # Get the queryset
    queryset = SuitabilityTest.objects.all()
    # geojson_data = serialize('geojson', queryset, fields=(suitabilityvalue, 'geom'))
    geojson_data = queryset.annotate(geomm=AsGeoJSON("geom")).values(suitabilityvalue,'geomm')
    # Return as JSON response
    return JsonResponse({'result': list(geojson_data)})

def get_form_class(form_name):
    forms_dict = {
        'Road Accessibility': RoadForm,
        'Population Density': PopulationDensityForm,
        'Distance to City or Settlement' : CityDistForm,
        'Existing Land Use': ReclassifyForm, 
    }
    return forms_dict.get(form_name, None)

    
def dynamic_table_view(request):
    if request.method == "POST":
        # Process form data
        data = request.POST.getlist("start")
        print("Received Data:", data)  # Debugging Output

    form = ReclassifyForm()
    return render(request, 'partials/table_form.html', {'form': form})

def get_form_content(request, form_name):
    print(form_name)
    FormClass = get_form_class(form_name)
    if FormClass:
        form = FormClass()
    else:
        form = None
    if form_name == 'Existing Land Use':
        return render(request, 'partials/table_form.html', {'form': form})
    return render(request, 'partials/form_tab.html', {'form': form, 'form_name': form_name})
    
    

def d3_flowchart_view(request):
    # Render the template in the 'partials' directory
    return render(request, 'partials/d3_flowchart.html')