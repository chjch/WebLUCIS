from rest_framework import routers
from Map.api.viewsets import MmdaViewSet, BufferViewSet, SuitabilityViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'mmdas', MmdaViewSet, basename='mmdas')
router.register(r'buffer', BufferViewSet, basename='buffer')
router.register(r'suitability', SuitabilityViewSet, basename='suitability')

urlpatterns = [
    path('', include(router.urls)),
    path('suitability/<str:suitabilityvalue>/', SuitabilityViewSet.as_view({'get': 'list_with_suitabilityvalue'}), name='suitability-list-with-value'),
]