from django import forms
from .models import GhanaMmda


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
