import { createClient } from "@/lib/supabase/server";
import { SubscribeButton } from "./subscribe-button";

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Abonnement Pro
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Acces complet a toutes les fonctionnalites de la plateforme.
          </p>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            9,99&euro;
            <span className="text-sm font-normal text-gray-500">/mois</span>
          </p>

          {user ? (
            <SubscribeButton />
          ) : (
            <a
              href="https://app.akyra.io/login?redirect=https://shop.akyra.io"
              className="block text-center w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition"
            >
              Se connecter pour payer
            </a>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        Akyra &mdash; Boutique
      </footer>
    </div>
  );
}
