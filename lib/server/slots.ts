import { addDays, at, fmtHM, hm } from "./time";

export type SlotSettings = { open_time: string; close_time: string; step_minutes: number; buffer_minutes: number; work_days: number[]; lead_days: number; max_days: number };

/* Pure function: which start times are free on each day of a month. No database, so it can be tested. */
export function computeSlots(o: { minutes: number; month: string; today: string; settings: SlotSettings; blocked: Set<string>; extra: Set<string>; busy: [number, number][] }) {
  const { settings: s } = o;
  const [y, m] = o.month.split("-").map(Number);
  const first = `${o.month}-01`, next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
  const min = addDays(o.today, s.lead_days), max = addDays(o.today, s.max_days);
  const slots: Record<string, string[]> = {};
  for (let d = first; d < next; d = addDays(d, 1)) {
    if (d < min || d > max || o.blocked.has(d)) continue;
    if (!s.work_days.includes(new Date(d + "T00:00:00Z").getUTCDay()) && !o.extra.has(d)) continue;
    const list: string[] = [];
    for (let t = hm(s.open_time); t + o.minutes <= hm(s.close_time); t += s.step_minutes) {
      const a = at(d, t).getTime(), b = at(d, t + o.minutes + s.buffer_minutes).getTime();
      if (!o.busy.some(([x, z]) => a < z && b > x)) list.push(fmtHM(t));
    }
    if (list.length) slots[d] = list;
  }
  return slots;
}
