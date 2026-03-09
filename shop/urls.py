from django.urls import path
from . import views
from akyra.urls import trac_script_proxy, trac_api_proxy

urlpatterns = [
    path("_trac/script.js", trac_script_proxy, name="trac_script"),
    path("_trac/api/<path:path>", trac_api_proxy, name="trac_api"),
    path("", views.shop_home, name="shop_home"),
    path("checkout/<str:price_id>/", views.checkout, name="checkout"),
    path("success/", views.success, name="checkout_success"),
    path("cancel/", views.cancel, name="checkout_cancel"),
]
