import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminUser } from "@/lib/server/admin";
import { db } from "@/lib/server/supabase";
import { LOOKS, CATEGORIES } from "@/data/looks";

export const runtime = "nodejs";
const int = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const day = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const clock = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export async function POST(req: Request) {
  if (!(await adminUser())) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const sb = db(), b = await req.json().catch(() => null);
  if (!sb || !b) return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  const bad = (m: string) => NextResponse.json({ ok: false, error: m }, { status: 400 });
  let error: { code?: string; message: string } | null = null;

  switch (b.type) {
    case "booking": {
      const patch: Record<string, unknown> = {};
      if (b.status !== undefined) { if (!["confirmed", "completed", "cancelled"].includes(b.status)) return bad("Invalid status."); patch.status = b.status; }
      if (typeof b.balance_paid === "boolean") patch.balance_paid = b.balance_paid;
      error = (await sb.from("bookings").update(patch).eq("id", str(b.id, 50))).error; break; }
    case "settings": {
      if (!clock(b.open_time) || !clock(b.close_time) || b.open_time >= b.close_time) return bad("Please check the opening and closing times.");
      if (![15, 30, 60].includes(b.step_minutes) || !int(b.buffer_minutes, 0, 240) || !int(b.deposit, 0, 10_000_000)) return bad("Please check the numbers.");
      if (!Array.isArray(b.work_days) || !b.work_days.every((d: unknown) => int(d, 0, 6))) return bad("Please check the working days.");
      error = (await sb.from("settings").update({ open_time: b.open_time, close_time: b.close_time, step_minutes: b.step_minutes, buffer_minutes: b.buffer_minutes, deposit: b.deposit, work_days: b.work_days }).eq("id", 1)).error; break; }
    case "date": {
      if (!day(b.day) || !["blocked", "extra"].includes(b.kind)) return bad("Invalid date.");
      const t = b.kind === "extra" ? "extra_dates" : "blocked_dates";
      error = (b.op === "remove" ? await sb.from(t).delete().eq("day", b.day) : await sb.from(t).upsert({ day: b.day })).error; break; }
    case "look": {
      const row = { name: str(b.name, 80), category: str(b.category, 60), description: str(b.description, 300), price: b.price, minutes: b.minutes, active: b.active !== false };
      if (!row.name || !row.category || !int(row.price, 0, 10_000_000) || !int(row.minutes, 15, 480)) return bad("Please check the name, category, price and duration.");
      if (b.id) error = (await sb.from("looks").update(row).eq("id", str(b.id, 50))).error;
      else { const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + randomBytes(2).toString("hex"); error = (await sb.from("looks").insert({ ...row, slug })).error; }
      break; }
    case "lookDelete": error = (await sb.from("looks").delete().eq("id", str(b.id, 50))).error; break;
    case "category": {
      const name = str(b.name, 60); if (!name) return bad("Please enter a category name.");
      error = (b.op === "remove" ? await sb.from("categories").delete().eq("name", name) : await sb.from("categories").insert({ name })).error;
      if (error?.code === "23503") return bad("That category is still used by a look. Move or remove those looks first.");
      break; }
    case "seed": { /* one-time import of the starter looks */
      const n = await sb.from("looks").select("id", { count: "exact", head: true });
      if ((n.count ?? 0) > 0) return bad("You already have looks.");
      await sb.from("categories").upsert(CATEGORIES.map((name, sort) => ({ name, sort })));
      error = (await sb.from("looks").insert(LOOKS.map((l) => ({ slug: l.slug, name: l.name, category: l.category, description: l.description, price: l.price, minutes: l.minutes })))).error; break; }
    default: return bad("Unknown action.");
  }
  if (error) return NextResponse.json({ ok: false, error: error.code === "23P01" ? "That time overlaps another booking." : error.code === "23505" ? "That already exists." : "Couldn’t save that. Please try again." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
