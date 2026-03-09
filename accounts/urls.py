from django.urls import path
from . import views
from akyra.urls import trac_script_proxy, trac_api_proxy

urlpatterns = [
    path("_trac/script.js", trac_script_proxy, name="trac_script"),
    path("_trac/api/<path:path>", trac_api_proxy, name="trac_api"),
    path("", views.redirect_to_login),
    path("login/", views.login_view, name="login"),
    path("register/", views.register_view, name="register"),
    path("logout/", views.logout_view, name="logout"),
    path("dashboard/", views.dashboard, name="dashboard"),
]
