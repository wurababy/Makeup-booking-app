import { db } from "./supabase";
import { at, addDays, fmtHM, hm, lagosToday } from "./time";

export type Settings = { open_time: string; close_time: string; step_minutes: number; buffer_minutes: number; work_days: number[]; deposit: number; lead_days: number; max_days: number };

export async function expireHolds() {
  await db()!.from("bookings").update({ status: "expired" }).eq("status", "pending").lt("hold_expires_at", new Date().toISOString());
}
export async function loadSettings() {
  const sb = db()!;
  const [a, b, c] = await Promise.all([sb.from("settings").select("*").eq("id", 1).single(), sb.from("blocked_dates").select("day"), sb.from("extra_dates").select("day")]);
  return { s: a.data as Settings, blocked: new Set((b.data ?? []).map((x) => x.day as string)), extra: new Set((c.data ?? []).map((x) => x.day as string)) };
}
/* Free start times per day for one month. Reads real bookings, so taken times are never offered. */
export async function freeSlots(minutes: number, month: string) {
  await expireHolds();
  const { s, blocked, extra } = await loadSettings();
  const [y, m] = month.split("-").map(Number);
  const first = `${month}-01`, next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const { data } = await db()!.from("bookings").select("start_at,end_at").in("status", ["pending", "confirmed"])
    .lt("start_at", at(next, 0).toISOString()).gt("end_at", at(first, 0).toISOString());
  const busy = (data ?? []).map((b) => [new Date(b.start_at).getTime(), new Date(b.end_at).getTime()]);
  const today = lagosToday(), min = addDays(today, s.lead_days), max = addDays(today, s.max_days);
  const slots: Record<string, string[]> = {};
  for (let d = first; d < next; d = addDays(d, 1)) {
    if (d < min || d > max || blocked.has(d)) continue;
    if (!s.work_days.includes(new Date(d + "T00:00:00Z").getUTCDay()) && !extra.has(d)) continue;
    const list: string[] = [];
    for (let t = hm(s.open_time); t + minutes <= hm(s.close_time); t += s.step_minutes) {
      const a = at(d, t).getTime(), b = at(d, t + minutes + s.buffer_minutes).getTime();
      if (!busy.some(([x, z]) => a < z && b > x)) list.push(fmtHM(t));
    }
    if (list.length) slots[d] = list;
  }
  return { slots, settings: s };
}
