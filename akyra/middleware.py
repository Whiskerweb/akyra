from django.urls import reverse
from django.http import HttpResponseRedirect


class SubdomainMiddleware:
    """Route requests based on subdomain."""

    BASE_DOMAIN = "akyra.io"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(":")[0]
        subdomain = self._get_subdomain(host)

        # Store subdomain on request for views
        request.subdomain = subdomain

        # Dev mode: allow ?subdomain= param
        if not subdomain:
            subdomain = request.GET.get("subdomain")
            if subdomain:
                request.subdomain = subdomain

        # Subdomain routing
        if subdomain == "app":
            request.urlconf = "accounts.urls"
        elif subdomain == "shop":
            request.urlconf = "shop.urls"

        return self.get_response(request)

    def _get_subdomain(self, host):
        if host in (self.BASE_DOMAIN, f"www.{self.BASE_DOMAIN}", "localhost", "127.0.0.1"):
            return None
        if host.endswith(f".{self.BASE_DOMAIN}"):
            return host.replace(f".{self.BASE_DOMAIN}", "")
        return None
