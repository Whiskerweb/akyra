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

    // Track sign_up event
    if (data.user) {
      const store = await cookies();
      const clickId = store.get("trac_click_id")?.value;

      const trac = new Traaaction();
      await trac.track.lead({
        clickId,
        customerId: data.user.id,
        eventName: "sign_up",
        customerEmail: data.user.email,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
