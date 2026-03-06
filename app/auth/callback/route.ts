import { createClient } from "@/lib/supabase/server";
import { Traaaction } from "traaaction";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "https://akyra.io";

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      const store = await cookies();
      const clickId = store.get("trac_click_id")?.value;

      try {
        const trac = new Traaaction();
        await trac.track.lead({
          clickId,
          customerId: data.user.id,
          eventName: "sign_up",
          customerEmail: data.user.email,
        });
      } catch (e) {
        console.error("[Traaaction] Lead tracking failed:", e);
      }
    }
  }

  return NextResponse.redirect(redirectTo);
}
