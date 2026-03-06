import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { ShopClient } from "./shop-client";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let products: {
    id: string;
    name: string;
    description: string | null;
    prices: { id: string; unit_amount: number | null; currency: string; recurring: string | null }[];
  }[] = [];

  try {
    const stripe = getStripe();
    const stripeProducts = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const stripePrices = await stripe.prices.list({ active: true });

    products = stripeProducts.data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      prices: stripePrices.data
        .filter((p) => p.product === product.id)
        .map((p) => ({
          id: p.id,
          unit_amount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring ? p.recurring.interval : null,
        })),
    }));
  } catch (e) {
    console.error("Failed to fetch Stripe products:", e);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <a href="https://akyra.io" className="text-xl font-bold text-gray-900">
          Akyra
        </a>
        <div>
          {user ? (
            <span className="text-sm text-gray-600">{user.email}</span>
          ) : (
            <a
              href="https://app.akyra.io/login?redirect=https://shop.akyra.io"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Se connecter
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Boutique</h1>

        {products.length === 0 ? (
          <p className="text-gray-500">Aucun produit disponible.</p>
        ) : (
          <ShopClient products={products} isLoggedIn={!!user} />
        )}
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        Akyra &mdash; Boutique
      </footer>
    </div>
  );
}
