import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/server/supabase";
import { freeSlots } from "@/lib/server/availability";
import { allowed } from "@/lib/server/rateLimit";
import { at, hm } from "@/lib/server/time";

export const runtime = "nodejs";
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip, 12)) return fail("Too many attempts. Please try again later.", 429);
  const b = await req.json().catch(() => null);
  const slug = text(b?.slug, 80), date = text(b?.date, 10), time = text(b?.time, 5);
  const name = text(b?.name, 80), phone = text(b?.phone, 30), email = text(b?.email, 120), occasion = text(b?.occasion, 80), notes = text(b?.notes, 500);
  if (!name || phone.replace(/\D/g, "").length < 7 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !occasion) return fail("Please fill in your name, phone, email and occasion.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return fail("Please choose a date and time.");
  const sb = db(), key = process.env.PAYSTACK_SECRET_KEY;
  if (!sb || !key) return fail("Online booking isn’t switched on yet.", 503);

  const { data: look } = await sb.from("looks").select("*").eq("slug", slug).eq("active", true).single();
  if (!look) return fail("Please choose a makeup look.");
  const { slots, settings } = await freeSlots(look.minutes, date.slice(0, 7));
  if (!slots[date]?.includes(time)) return fail("That time is no longer available. Please choose another.", 409);
  const deposit = Math.min(settings.deposit, look.price);
  if (deposit <= 0) return fail("Pricing isn’t set up for this look yet.", 503);

  const ref = "BK" + randomBytes(4).toString("hex").toUpperCase();
  const ins = await sb.from("bookings").insert({
    ref, look_id: look.id, look_name: look.name, price: look.price, deposit,
    start_at: at(date, hm(time)).toISOString(), end_at: at(date, hm(time) + look.minutes + settings.buffer_minutes).toISOString(),
    status: "pending", hold_expires_at: new Date(Date.now() + 15 * 60_000).toISOString(), name, phone, email, occasion, notes,
  });
  if (ins.error) return ins.error.code === "23P01" ? fail("That time was just taken. Please choose another.", 409) : fail("We couldn’t save your booking. Please try again.", 500);

  const site = process.env.SITE_URL ?? new URL(req.url).origin;
  const r = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: deposit * 100, currency: "NGN", reference: ref, callback_url: `${site}/book/confirmation?ref=${ref}` }),
  });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.status || !j?.data?.authorization_url) {
    await sb.from("bookings").update({ status: "cancelled" }).eq("ref", ref); /* nothing is held if payment can't start */
    return fail("We couldn’t start the payment. Please try again.", 502);
  }
  return NextResponse.json({ ok: true, url: j.data.authorization_url as string });
}
