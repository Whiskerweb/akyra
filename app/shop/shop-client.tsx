"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  prices: {
    id: string;
    unit_amount: number | null;
    currency: string;
    recurring: string | null;
  }[];
};

function formatPrice(amount: number | null, currency: string) {
  if (amount === null) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount / 100);
}

function recurringLabel(interval: string | null) {
  if (!interval) return "";
  const labels: Record<string, string> = {
    day: "/jour",
    week: "/semaine",
    month: "/mois",
    year: "/an",
  };
  return labels[interval] || `/${interval}`;
}

export function ShopClient({
  products,
  isLoggedIn,
}: {
  products: Product[];
  isLoggedIn: boolean;
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleProduct(productId: string, priceId: string) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[productId] === priceId) {
        delete next[productId];
      } else {
        next[productId] = priceId;
      }
      return next;
    });
  }

  const selectedPriceIds = Object.values(selected);

  async function handleCheckout() {
    if (selectedPriceIds.length === 0) return;

    if (!isLoggedIn) {
      window.location.href =
        "https://app.akyra.io/login?redirect=https://shop.akyra.io";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceIds: selectedPriceIds }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Erreur lors de la creation de la session");
        setLoading(false);
      }
    } catch {
      setError("Erreur reseau");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {products.map((product) => {
          const price = product.prices[0];
          if (!price) return null;

          const isSelected = selected[product.id] === price.id;

          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id, price.id)}
              className={`text-left p-6 rounded-xl border-2 transition cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold text-gray-900 mb-1">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-sm text-gray-500 mb-3">
                  {product.description}
                </p>
              )}
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(price.unit_amount, price.currency)}
                <span className="text-sm font-normal text-gray-500">
                  {recurringLabel(price.recurring)}
                </span>
              </p>
            </button>
          );
        })}
      </div>

      {selectedPriceIds.length > 0 && (
        <div className="sticky bottom-6 flex justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedPriceIds.length} article
              {selectedPriceIds.length > 1 ? "s" : ""} selectionne
              {selectedPriceIds.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Redirection..."
                : isLoggedIn
                  ? "Payer"
                  : "Se connecter pour payer"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
