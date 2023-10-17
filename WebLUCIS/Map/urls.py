from django.urls import path
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    # path('map/about/', views.about, name='map-about'),
    # path('mmdas/', views.mmdas, name='mmdas'),
    # path('api/', views.MmdaListAPIView.as_view(), name='mmdas-api'),
]

htmx_urlpatterns = [
    path('load_districts/', views.load_districts, name='districts'),
    # path('get_district_id/', views.get_district_id, name='district-id'),
]

urlpatterns += htmx_urlpatterns
