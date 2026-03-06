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

      console.log("[AKYRA DEBUG]", {
        clickId,
        hasApiKey: !!process.env.TRAAACTION_API_KEY,
        apiKeyPrefix: process.env.TRAAACTION_API_KEY?.slice(0, 8),
      });

      try {
        const trac = new Traaaction();
        const result = await trac.track.lead({
          clickId,
          customerId: data.user.id,
          eventName: "sign_up",
          customerEmail: data.user.email,
        });
        console.log("[AKYRA DEBUG] SDK result:", result);
      } catch (err) {
        console.error("[AKYRA DEBUG] SDK error:", err);
      }
    }
  }

  return NextResponse.redirect(redirectTo);
}
