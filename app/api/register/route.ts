import { createClient } from "@/lib/supabase/server";
import { Traaaction } from "traaaction";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Track sign_up event (non-blocking)
    if (data.user) {
      try {
        const store = await cookies();
        const clickId = store.get("trac_click_id")?.value;

        console.log("Traaaction tracking:", {
          hasApiKey: !!process.env.TRAAACTION_API_KEY,
          apiKeyPrefix: process.env.TRAAACTION_API_KEY?.slice(0, 5),
          clickId,
          userId: data.user.id,
        });

        const trac = new Traaaction({ apiKey: process.env.TRAAACTION_API_KEY! });
        await trac.track.lead({
          clickId,
          customerId: data.user.id,
          eventName: "sign_up",
          customerEmail: data.user.email,
        });
      } catch (tracError) {
        console.error("Traaaction tracking failed:", tracError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
