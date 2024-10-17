from django import forms
from .models import GhanaMmda, SuitabilityTest


class MmdaForm(forms.Form):
    region = forms.ModelChoiceField(
        queryset=GhanaMmda.objects.values("region")
        .distinct()
        .order_by("region")
        .values_list("region", flat=True),
        empty_label="Choose a Region",
        # widget=forms.Select(
        #     attrs={
        #         "hx-get": "load_districts",
        #         "hx-target": "#id_district",
        #     }
        # ),
    )
    district = forms.ModelChoiceField(
        queryset=GhanaMmda.objects.none(),
        label="District",
    )


class BufferForm(forms.Form):
    distance = forms.DecimalField(
        widget=forms.NumberInput(attrs={"placeholder": "Enter the Distance"}),
        label="Distance",
    )
    unit = forms.ChoiceField(
        widget=forms.Select,
        choices=[("1", ""), ("2", "Miles"), ("3", "Kilometers")],
        label="Unit",
    )



class SuitabilityTestForm(forms.ModelForm):
    class Meta:
        model = SuitabilityTest
        fields = '__all__'

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