from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('submit_road_form/', views.submit_road_form, name='submit_road_form'),
    path('submit_popdensity_form/', views.submit_popdensity_form, name='submit_popdensity_form'),
    path('submit_citydist_form/', views.submit_citydist_form, name='submit_citydist_form'),
    path('submit_urbanproximity_form/', views.submit_urbanproximity_form, name='submit_urbanproximity_form'),
    path('submit_landusage_form/', views.submit_landusage_form, name='submit_landusage_form'),
    path('get-form-content/<str:form_name>/', views.get_form_content, name='get_form_content'),
    path('map-test/', views.map_test, name='map_test'),
]

htmx_urlpatterns = [
    path('load_districts/', views.load_districts, name='districts'),
    # path('get_district_id/', views.get_district_id, name='district-id'),
]

urlpatterns += htmx_urlpatterns
