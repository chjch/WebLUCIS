from rest_framework import routers
from Map.api.viewsets import MmdaViewSet, MmdaDataDynamicViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'mmdas', MmdaViewSet, basename='mmdas')
router.register(r'mmdas_study_area', MmdaDataDynamicViewSet, basename='mmdas_study_area')

urlpatterns = [
    path('', include(router.urls)),
]