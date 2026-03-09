import json
import logging
import urllib.request
import urllib.error
from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from traaaction.django import get_click_id

logger = logging.getLogger(__name__)


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

        # Traaaction lead tracking — synchronous call (daemon threads die on serverless)
        click_id = get_click_id(request)
        logger.error(f"[Traaaction] click_id: {click_id}, user: {user.id}/{user.email}")
        try:
            payload = json.dumps({
                "clickId": click_id or "",
                "eventName": "sign_up",
                "customerId": str(user.id),
                "customerEmail": user.email,
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://link.akyra.io/api/track/lead",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "x-publishable-key": settings.TRAAACTION_PUBLIC_KEY,
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                body = resp.read().decode()
                logger.error(f"[Traaaction] Lead tracked OK: {resp.status} {body}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            logger.error(f"[Traaaction] Lead tracking HTTP {e.code}: {body}")
        except Exception as e:
            logger.error(f"[Traaaction] Lead tracking failed: {e}")

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
