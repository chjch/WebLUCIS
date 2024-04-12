# Generated by Django 4.2.1 on 2023-07-21 20:16

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Map", "0002_gh260mmda_alter_ghanadistricts_geom"),
    ]

    operations = [
        migrations.CreateModel(
            name="GhanaMmda",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("region", models.CharField(max_length=50)),
                ("district", models.CharField(max_length=50)),
                ("district_c", models.CharField(max_length=50)),
                (
                    "geom",
                    django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326),
                ),
            ],
        ),
        migrations.DeleteModel(
            name="GhanaDistricts",
        ),
    ]
