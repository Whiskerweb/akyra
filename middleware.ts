import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  // Refresh Supabase session (skip if env vars not set)
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, {
                ...options,
                domain: ".akyra.io",
              });
            });
          },
        },
      }
    );

    await supabase.auth.getUser();
  }

  // Subdomain routing
  const currentHost = hostname.replace(":3000", "").replace(":3001", "");

  // Local dev simulation via query param ?subdomain=app or ?subdomain=shop
  const subdomain =
    request.nextUrl.searchParams.get("subdomain") ||
    getSubdomain(currentHost, "akyra.io");

  if (subdomain === "shop") {
    const url = request.nextUrl.clone();
    url.pathname = `/shop${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url, { request, headers: response.headers });
  }

  if (subdomain === "app") {
    const url = request.nextUrl.clone();
    // Default to /login if hitting root of app subdomain
    if (pathname === "/") {
      url.pathname = "/login";
    } else {
      url.pathname = pathname;
    }
    return NextResponse.rewrite(url, { request, headers: response.headers });
  }

  return response;
}

function getSubdomain(host: string, baseDomain: string): string | null {
  if (host === baseDomain || host === `www.${baseDomain}`) return null;
  const sub = host.replace(`.${baseDomain}`, "");
  if (sub === host) return null; // no match
  return sub;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
