import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const body = await request.json();
    const priceIds: string[] = body.priceIds;

    if (!priceIds || priceIds.length === 0) {
      return NextResponse.json(
        { error: "Aucun article selectionne" },
        { status: 400 }
      );
    }

    // Check if any price is recurring to determine checkout mode
    const stripe = getStripe();
    const prices = await Promise.all(
      priceIds.map((id) => stripe.prices.retrieve(id))
    );

    const hasRecurring = prices.some((p) => p.recurring);
    const mode = hasRecurring ? "subscription" : "payment";

    const store = await cookies();
    const clickId = store.get("trac_click_id")?.value;

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: priceIds.map((priceId) => ({
        price: priceId,
        quantity: 1,
      })),
      metadata: {
        tracCustomerExternalId: user.id,
        tracClickId: clickId || "",
      },
      success_url: "https://shop.akyra.io?success=true",
      cancel_url: "https://shop.akyra.io",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
