from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('submit_form/', views.submit_form, name='submit_form'),
    path('submit/', views.submit, name='submit'),
    path('fetch_suitability/', views.fetch_suitability, name='fetch_suitability'),
    path('submit_road_form/', views.submit_road_form, name='submit_road_form'),
    path('submit_popdensity_form/', views.submit_popdensity_form, name='submit_popdensity_form'),
    path('submit_landusage_form/', views.submit_landusage_form, name='submit_landusage_form'),
    path('get-form-content/<str:form_name>/', views.get_form_content, name='get_form_content'),
    path('d3-flowchart/', views.d3_flowchart_view, name='d3_flowchart'),
    path('submit_citydist_form/', views.submit_citydist_form, name='submit_citydist_form'),
    path('dynamic-table/', views.dynamic_table_view, name='dynamic_table'),
    
    # path('map/about/', views.about, name='map-about'),
    # path('mmdas/', views.mmdas, name='mmdas'),
    # path('api/', views.MmdaListAPIView.as_view(), name='mmdas-api'),
]

htmx_urlpatterns = [
    path('load_districts/', views.load_districts, name='districts'),
    # path('get_district_id/', views.get_district_id, name='district-id'),
]



urlpatterns += htmx_urlpatterns
