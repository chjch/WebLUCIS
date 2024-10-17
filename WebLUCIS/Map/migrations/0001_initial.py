# Generated by Django 4.2.16 on 2024-10-17 17:38

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GhanaMGRS',
            fields=[
                ('gid', models.AutoField(primary_key=True, serialize=False)),
                ('mgrs', models.CharField(max_length=50)),
                ('geom', django.contrib.gis.db.models.fields.PolygonField(srid=3857)),
            ],
            options={
                'db_table': 'ghanamgrs',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='GhanaMmda',
            fields=[
                ('gid', models.AutoField(primary_key=True, serialize=False)),
                ('region', models.CharField(max_length=50)),
                ('district', models.CharField(max_length=50)),
                ('district_c', models.CharField(max_length=254)),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=3857)),
            ],
            options={
                'db_table': 'ghanammda',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='GhanaPopDens',
            fields=[
                ('rid', models.AutoField(primary_key=True, serialize=False)),
                ('rast', django.contrib.gis.db.models.fields.RasterField(srid=4326)),
                ('filename', models.TextField()),
            ],
            options={
                'db_table': 'ghanapopdens',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='GhanaRoads',
            fields=[
                ('gid', models.AutoField(primary_key=True, serialize=False)),
                ('fclass', models.CharField(max_length=100)),
                ('geom', django.contrib.gis.db.models.fields.MultiLineStringField(srid=3857)),
            ],
            options={
                'db_table': 'ghanaroads',
                'managed': False,
            },
        ),
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
    ]