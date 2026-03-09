import httpx
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.views.decorators.csrf import csrf_exempt


def trac_script_proxy(request):
    r = httpx.get('https://link.akyra.io/trac.js')
    return HttpResponse(r.content, content_type='application/javascript')


@csrf_exempt
def trac_api_proxy(request, path):
    url = 'https://link.akyra.io/api/' + path
    r = httpx.request(request.method, url,
        content=request.body,
        headers={'Content-Type': 'application/json'})
    return HttpResponse(r.content, status=r.status_code)


urlpatterns = [
    path("admin/", admin.site.urls),
    path('_trac/script.js', trac_script_proxy),
    re_path(r'^_trac/api/(?P<path>.+)$', trac_api_proxy),
    path("", include("landing.urls")),
]
