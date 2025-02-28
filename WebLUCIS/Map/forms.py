from django import forms
from .models import GhanaMmda


class MmdaForm(forms.Form):
    region = forms.ModelChoiceField(
        queryset=GhanaMmda.objects.values("region")
        .distinct()
        .order_by("region")
        .values_list("region", flat=True),
        empty_label="Choose a Region",
    )
    district = forms.ModelChoiceField(
        queryset=GhanaMmda.objects.none(),
        label="District",
    )


class RoadForm(forms.Form):
    ROAD_CLASS_CHOICES = [
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('primary_secondary', 'Primary and Secondary'),
    ]

    DISTANCE_METHOD_CHOICES = [
        ('euclidean', 'Euclidean'),
        ('manhattan', 'Manhattan'),
    ]

    road_class = forms.ChoiceField(
        choices=ROAD_CLASS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control mb-3'}),
        label='Road Class:'
    )

    cell_size = forms.IntegerField(
        initial=30,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rasterize Cell Size:'
    )

    method = forms.ChoiceField(
        choices=DISTANCE_METHOD_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control mb-3'}),
        label='Distance Method:'
    )

    rescale_min = forms.IntegerField(
        initial=1,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Min:'
    )

    rescale_max = forms.IntegerField(
        initial=9,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Max:'
    )


class PopulationDensityForm(forms.Form):
    STATS_CHOICES = [
        ('mean', 'Mean'),
        ('median', 'Median'),
        ('max', 'Max'),
        ('min', 'Min'),
        ('majority', 'Majority')
    ]

    stats_type = forms.ChoiceField(
        choices=STATS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control mb-3'}),
        label='Aggregation Method:'
    )

    rescale_min = forms.IntegerField(
        initial=1,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Min:'
    )

    rescale_max = forms.IntegerField(
        initial=9,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Max:'
    )


class CityDistForm(forms.Form):
    STATS_CHOICES = [
        ('mean', 'Mean'),
        ('median', 'Median'),
        ('max', 'Max'),
        ('min', 'Min'),
        ('majority', 'Majority')
    ]
    stats_type = forms.ChoiceField(
        choices=STATS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control mb-3'}),
        label='Aggregation Method:'
    )
    rescale_min = forms.IntegerField(
        initial=1,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Min:'
    )
    rescale_max = forms.IntegerField(
        initial=9,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Rescale Max:'
    )


class ProximityForm(forms.Form):
    road_accessibility_weight = forms.FloatField(
        initial=0.5,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Road Accessibility Weight:'
    )

    city_distance_weight = forms.FloatField(
        initial=0.5,
        widget=forms.NumberInput(attrs={'class': 'form-control mb-3'}),
        label='Distance to City Weight:'
    )

class ReclassifyForm(forms.Form):
    STATS_CHOICES = [
        ('mean', 'Mean'),
        ('median', 'Median'),
        ('max', 'Max'),
        ('min', 'Min'),
        ('majority', 'Majority')
    ]
    stats_type = forms.ChoiceField(
        choices=STATS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control mb-3'}),
        label='Aggregation Method'
    )
    start = forms.IntegerField(widget=forms.NumberInput(attrs={'class': 'form-control start'}))
    end = forms.IntegerField(widget=forms.NumberInput(attrs={'class': 'form-control end'}))
    new_value = forms.IntegerField(widget=forms.NumberInput(attrs={'class': 'form-control new_value'}))