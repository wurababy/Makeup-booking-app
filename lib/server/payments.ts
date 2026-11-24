import { db } from "./supabase";
import { niceDate, niceTime } from "./time";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export async function sendEmail(to: string, subject: string, html: string) {
  const k = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!k || !from || !to) return;
  await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject, html }) }).catch(() => {});
}

export type Outcome = { state: "confirmed" | "failed" | "refund" | "notfound"; booking?: Record<string, any> };

/* The ONLY place a booking becomes confirmed. It asks Paystack directly, so a browser can never fake a payment. */
export async function confirmPayment(ref: string): Promise<Outcome> {
  const sb = db(), key = process.env.PAYSTACK_SECRET_KEY;
  if (!sb || !key || !/^BK[0-9A-F]{8}$/.test(ref)) return { state: "notfound" };
  const { data: b } = await sb.from("bookings").select("*").eq("ref", ref).single();
  if (!b) return { state: "notfound" };
  if (b.status === "confirmed" || b.status === "completed") return { state: "confirmed", booking: b };
  if (b.status === "needs_refund") return { state: "refund", booking: b };
  if (b.status === "cancelled") return { state: "failed", booking: b };

  const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
  const j = await r.json().catch(() => null);
  const d = j?.data;
  if (!r.ok || d?.status !== "success") return { state: "failed", booking: b }; /* unpaid, abandoned or failed: nothing is confirmed */
  if (d.amount !== b.deposit * 100 || d.currency !== "NGN") { await sb.from("bookings").update({ status: "needs_refund", paystack_ref: ref }).eq("id", b.id); return { state: "refund", booking: b }; }

  const upd = await sb.from("bookings").update({ status: "confirmed", hold_expires_at: null, paystack_ref: ref }).eq("id", b.id).in("status", ["pending", "expired"]).select();
  if (upd.error) { /* paid after the hold lapsed and someone else took the time */
    await sb.from("bookings").update({ status: "needs_refund", paystack_ref: ref }).eq("id", b.id);
    await sendEmail(process.env.STUDIO_EMAIL ?? "", "Booking needs a refund", `<p>Payment ${esc(ref)} was received but the time was taken. Please refund ${esc(b.name)}.</p>`);
    return { state: "refund", booking: b };
  }
  if (upd.data?.length) { /* first confirmation only: send emails once */
    const rows = `<p><b>${esc(b.look_name)}</b><br>${esc(niceDate(b.start_at))} at ${esc(niceTime(b.start_at))}<br>Deposit paid: ${naira(b.deposit)}<br>Balance due: ${naira(Math.max(b.price - b.deposit, 0))}<br>Reference: ${esc(ref)}</p>`;
    await sendEmail(b.email, "You’re booked, beautiful!", `<h2>You’re Booked, Beautiful!</h2><p>Hi ${esc(b.name.split(" ")[0])}, your appointment is confirmed.</p>${rows}`);
    await sendEmail(process.env.STUDIO_EMAIL ?? "", `New booking: ${b.name}`, `${rows}<p>${esc(b.name)} · ${esc(b.phone)} · ${esc(b.email)}<br>Occasion: ${esc(b.occasion)}<br>Notes: ${esc(b.notes ?? "")}</p>`);
  }
  return { state: "confirmed", booking: { ...b, status: "confirmed" } };
}
