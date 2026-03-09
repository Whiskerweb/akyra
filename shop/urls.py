from django.urls import path
from . import views

urlpatterns = [
    path("", views.shop_home, name="shop_home"),
    path("checkout/<str:price_id>/", views.checkout, name="checkout"),
    path("success/", views.success, name="checkout_success"),
    path("cancel/", views.cancel, name="checkout_cancel"),
]
