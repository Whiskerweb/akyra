import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">Akyra</span>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Bonjour {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <a
              href="https://app.akyra.io/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Se connecter
            </a>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue sur Akyra
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Plateforme de test pour l&apos;integration d&apos;outils de tracking
            d&apos;affiliation.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://app.akyra.io/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Se connecter
            </a>
            <a
              href="https://shop.akyra.io"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Voir la boutique
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500">
        Akyra &mdash; Site de test
      </footer>
    </div>
  );
}
