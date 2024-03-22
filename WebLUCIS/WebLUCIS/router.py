from rest_framework import routers
from Map.api.viewsets import MmdaViewSet, BufferViewSet

router = routers.DefaultRouter()
router.register(r'mmdas', MmdaViewSet, basename='mmdas')
router.register(r'buffer', BufferViewSet, basename='buffer')
