import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebLUCIS.WebLUCIS.settings')

app = Celery('WebLUCIS')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.beat_schedule = {
    'delete-expired-geo-data': {
        'task': 'WebLUCIS.Map.tasks.delete_expired_geo_data',
        'schedule': crontab(minute=0, hour=0),  # Run daily at midnight
    },
}