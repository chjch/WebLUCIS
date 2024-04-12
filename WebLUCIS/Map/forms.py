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