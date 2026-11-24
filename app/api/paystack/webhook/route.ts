import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/server/payments";

export const runtime = "nodejs";

/* Paystack calls this when a payment succeeds, even if the client closed their browser. */
export async function POST(req: Request) {
  const raw = await req.text(), key = process.env.PAYSTACK_SECRET_KEY ?? "";
  const expected = createHmac("sha512", key).update(raw).digest();
  const given = Buffer.from(req.headers.get("x-paystack-signature") ?? "", "hex");
  if (!key || given.length !== expected.length || !timingSafeEqual(given, expected)) return new NextResponse("Invalid signature", { status: 401 });
  try {
    const evt = JSON.parse(raw);
    if (evt.event === "charge.success" && typeof evt.data?.reference === "string") await confirmPayment(evt.data.reference);
  } catch { /* ignore malformed events */ }
  return NextResponse.json({ ok: true });
}
