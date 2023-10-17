from rest_framework import routers
from Map.api.viewsets import MmdaViewSet

router = routers.DefaultRouter()
router.register(r'mmdas', MmdaViewSet, basename='mmdas')
