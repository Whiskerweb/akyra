import stripe
from django.conf import settings
from django.shortcuts import render, redirect
from traaaction.django import get_click_id

stripe.api_key = settings.STRIPE_SECRET_KEY


def shop_home(request):
    products = []
    if settings.STRIPE_SECRET_KEY:
        stripe_products = stripe.Product.list(active=True, limit=20)
        for product in stripe_products.data:
            prices = stripe.Price.list(product=product.id, active=True, limit=1)
            if prices.data:
                price = prices.data[0]
                products.append(
                    {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description or "",
                        "image": product.images[0] if product.images else None,
                        "price": price.unit_amount / 100,
                        "currency": price.currency.upper(),
                        "price_id": price.id,
                    }
                )
    return render(request, "shop/index.html", {"products": products})


def checkout(request, price_id):
    if not settings.STRIPE_SECRET_KEY:
        return redirect("shop_home")

    click_id = get_click_id(request)
    metadata = {
        "tracCustomerExternalId": str(request.user.id) if request.user.is_authenticated else "",
        "tracClickId": click_id or "",
    }

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="payment",
        metadata=metadata,
        success_url=request.build_absolute_uri("/success/"),
        cancel_url=request.build_absolute_uri("/cancel/"),
        customer_email=request.user.email if request.user.is_authenticated else None,
    )
    return redirect(session.url)


def success(request):
    return render(request, "shop/success.html")


def cancel(request):
    return render(request, "shop/cancel.html")
