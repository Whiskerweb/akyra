import logging
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from traaaction import Traaaction
from traaaction.django import get_click_id

logger = logging.getLogger(__name__)

trac = Traaaction(api_key=settings.TRAAACTION_API_KEY)


def redirect_to_login(request):
    return redirect("login")


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")

        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            login(request, user)
            next_url = request.GET.get("next", "/dashboard/")
            return redirect(next_url)
        else:
            messages.error(request, "Email ou mot de passe incorrect.")

    return render(request, "accounts/login.html")


def register_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    if request.method == "POST":
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")

        if User.objects.filter(email=email).exists():
            messages.error(request, "Un compte avec cet email existe deja.")
            return render(request, "accounts/register.html")

        if len(password) < 6:
            messages.error(request, "Le mot de passe doit contenir au moins 6 caracteres.")
            return render(request, "accounts/register.html")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )

        # Traaaction lead tracking at signup (before login/redirect)
        click_id = get_click_id(request)
        logger.error(f"[Traaaction] click_id from get_click_id: {click_id}")
        logger.error(f"[Traaaction] cookies: {request.COOKIES}")
        logger.error(f"[Traaaction] user.id: {user.id}, user.email: {user.email}")
        try:
            result = trac.track.lead(
                click_id=click_id,
                event_name="sign_up",
                customer_id=str(user.id),
                customer_email=user.email,
            )
            logger.error(f"[Traaaction] Lead tracking result: {result}")
        except Exception as e:
            logger.error(f"[Traaaction] Lead tracking failed: {e}")
            import traceback
            logger.error(f"[Traaaction] Traceback: {traceback.format_exc()}")

        login(request, user)
        messages.success(request, "Compte cree avec succes.")
        return redirect("dashboard")

    return render(request, "accounts/register.html")


def logout_view(request):
    logout(request)
    return redirect("https://akyra.io")


@login_required
def dashboard(request):
    return render(request, "accounts/dashboard.html")
