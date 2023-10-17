# Generated by Django 4.2.1 on 2023-07-18 14:27

import django.contrib.gis.db.models.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Map", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Gh260Mmda",
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
                (
                    "geom",
                    django.contrib.gis.db.models.fields.MultiPolygonField(
                        blank=True, null=True, srid=32630
                    ),
                ),
                ("region", models.CharField(blank=True, max_length=50, null=True)),
                ("district", models.CharField(blank=True, max_length=50, null=True)),
                ("district_c", models.CharField(blank=True, max_length=254, null=True)),
            ],
            options={
                "db_table": "gh_260_mmda",
                "managed": True,
            },
        ),
        migrations.AlterField(
            model_name="ghanadistricts",
            name="geom",
            field=django.contrib.gis.db.models.fields.MultiPolygonField(srid=32630),
        ),
    ]