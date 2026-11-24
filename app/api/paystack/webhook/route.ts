import { NextResponse } from "next/server";
import { validSignature } from "@/lib/server/signature";
import { confirmPayment } from "@/lib/server/payments";

export const runtime = "nodejs";

/* Paystack calls this when a payment succeeds, even if the client closed their browser. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature") ?? "", process.env.PAYSTACK_SECRET_KEY ?? "")) return new NextResponse("Invalid signature", { status: 401 });
  try {
    const evt = JSON.parse(raw);
    if (evt.event === "charge.success" && typeof evt.data?.reference === "string") await confirmPayment(evt.data.reference);
  } catch { /* ignore malformed events */ }
  return NextResponse.json({ ok: true });
}
