import geopandas as gpd
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from django.shortcuts import render
from django.http import JsonResponse
from .script import *
import json
from LUCISModels import(
    urb1o11so111,
    urb1o11so113,
    urb1o12so121,
    urb1o12so122,
    utilities
)
from .models import GhanaMmda
from .forms import * 

def home(request):
    form = MmdaForm()
    context = {"title": "Map", "is_map": True, "form": form}
    return render(request, "home.html", context)


def load_districts(request):
    region = request.GET.get("region")
    districts = GhanaMmda.objects.filter(region=region)
    all_districts = [{'gid': '0', 'district': 'All Districts', 'district_c': None}] + \
                    [{'gid': d.gid, 'district': d.district, 'district_c': d.district_c} for d in districts]

    context = {'districts': all_districts}
    return render(request, "partials/load_districts.html", context)


def submit_road_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    road_class = request.POST.get('road_class')
    cell_size = request.POST.get('cell_size')
    method = request.POST.get('method')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region, district_id)
    road_result, road_col = urb1o12so121.URB1O12SO121(study_gdf, road_class, cell_size, method, rescale_min, rescale_max)
    utilities.save_to_output_db(road_result, road_col)

    return JsonResponse({'result': road_result.to_json()})

def submit_popdensity_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    stats_type = request.POST.get('stats_type')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region, district_id)
    pop_density, pd_col = urb1o11so113.URB1O11SO113(study_gdf, stats_type, rescale_min, rescale_max)
    utilities.save_to_output_db(pop_density, pd_col)

    return JsonResponse({'result': pop_density.to_json()})


def submit_citydist_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    stats_type = request.POST.get('stats_type')
    rescale_min = request.POST.get('rescale_min')
    rescale_max = request.POST.get('rescale_max')
    study_gdf = select_study_area(region, district_id)
    city_dist, city_col = urb1o12so122.URB1O12SO122(study_gdf, stats_type, rescale_min, rescale_max)
    utilities.save_to_output_db(city_dist, city_col)

    return JsonResponse({'result': city_dist.to_json()})


def submit_landusage_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    stats_type = request.POST.get('stats_type')
    start_value = request.POST.getlist('start_value')
    end_value = request.POST.getlist('end_value')
    new_value = request.POST.getlist('new_value')
    reclassify_dict = {}
    for i in range(len(start_value)):
       if start_value[i] != '' and end_value[i] != '' and new_value[i] != '':
           start = float(start_value[i])
           end = float(end_value[i])
           new = float(new_value[i])
           reclassify_dict[(start, end)] = new
    print(reclassify_dict)
    # return JsonResponse({'result': 'land usage form'})
    study_gdf = select_study_area(region, district_id)
    land_cover, lc_out_col = urb1o11so111.URB1O11SO111(study_gdf, stats_type, reclassify_dict)
    utilities.save_to_output_db(land_cover, lc_out_col)

    return JsonResponse({'result': land_cover.to_json()})


def submit_urbanproximity_form(request):
    region = request.POST.get('region')
    district_id = request.POST.get('district')
    ra_weight = request.POST.get('road_accessibility_weight')
    cd_weight = request.POST.get('city_distance_weight')
    output_db_engine = create_engine("postgresql://postgres:output151010@output_db:5432/output_db")

    if int(district_id) == 0:
        study_table_name = f"{region.lower()}_output"
    else:
        district_obj = GhanaMmda.objects.filter(gid=district_id).first()
        district_c = district_obj.district_c
        study_table_name = f"{district_c.lower()}_output"
    
    urb = gpd.read_postgis(
        f'SELECT * FROM "{study_table_name}"',
        output_db_engine,
        geom_col="geom"
    )
    urb['URB1O12'] = (
        urb['URB1O12SO121'] * float(ra_weight) +
        urb['URB1O12SO122'] * float(cd_weight)
    )
    urb1o2 = urb[['gid_left', 'gid_mmda', 'region', 'district', 'district_c', 'geom', 'URB1O12']]
    utilities.save_to_output_db(urb1o2, 'URB1O12')

    return JsonResponse({'result': urb.to_json()})


def get_form_class(form_name):
    forms_dict = {
        'Road Accessibility': RoadForm,
        'Population Density': PopulationDensityForm,
        'Distance to City or Settlement': CityDistForm,
        'Proximity Merge': ProximityForm,
        'Existing Land Use': ReclassifyForm
    }
    return forms_dict.get(form_name, None)


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


# def get_form_content(request, form_name):
#     print(form_name)
#     FormClass = get_form_class(form_name)
#     form = FormClass() if FormClass else None
#     return render(request, 'partials/form_tab.html', {'form': form, 'form_name': form_name})

def map_test(request):
    return render(request, 'JSON_test.html')