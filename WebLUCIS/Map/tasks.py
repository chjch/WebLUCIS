from celery import shared_task
from .models import GeoJSONData
from django.utils import timezone

@shared_task
def delete_expired_geo_data():
    expired_instances = GeoJSONData.objects.filter(expiry_date__lt=timezone.now())
    expired_instances.delete()