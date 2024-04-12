# Generated by Django 4.2.11 on 2024-03-28 17:37

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Map', '0013_geojsondata_delete_geodata'),
    ]

    operations = [
        migrations.CreateModel(
            name='SuitabilityTest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('road', models.FloatField()),
                ('road_suit', models.FloatField()),
                ('pop', models.FloatField()),
                ('pop_suit', models.FloatField()),
                ('urb', models.FloatField()),
                ('urb_suit', models.FloatField()),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
            ],
        ),
        migrations.CreateModel(
            name='VectorTest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('region', models.CharField(max_length=50)),
                ('district', models.CharField(max_length=50)),
                ('district_c', models.CharField(max_length=50)),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
            ],
        ),
        migrations.DeleteModel(
            name='GeoJSONData',
        ),
    ]
