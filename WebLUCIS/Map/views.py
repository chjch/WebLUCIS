from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse

# from django.http import JsonResponse
from .models import GhanaMmda
from .forms import MmdaForm, BufferForm
from .filters import GhanaMmdaFilter


def home(request):
    form = MmdaForm()
    form_buffer = BufferForm()
    context = {"title": "Map", "is_map": True, "form": form, "form_buffer": form_buffer}
    return render(request, "home.html", context)


# def buffer(request):
#     form_buffer = BufferForm()
#     return render(request, "partials/buffer_form.html", {"form_buffer": form_buffer})


# def mmdas(request):
#     form = MmdaForm()
#     # regions = GhanaMmda.objects.values('region').distinct() # noqa
#     # regions = {k+1: v['region'] for k, v in enumerate(regions)}
#     context = {"form": form}
#     return render(request, "partials/control_panel.html", context)


def load_districts(request):
    region = request.GET.get("region")
    districts = GhanaMmda.objects.filter(region=region)
    context = {"districts": districts}
    return render(request, "partials/load_districts.html", context)


# def get_district_id(request):
#     district_id = request.POST.get("district")
#     context = {"district_id": district_id}
#     return render(request, "partials/district_id.html", context)
