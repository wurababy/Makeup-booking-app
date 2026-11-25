export const CURRENCIES = ["NGN", "GHS", "KES", "ZAR", "USD"] as const;
export const TIMEZONES = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Europe/London", "America/New_York"] as const;

export type ProfileInput = {
  business_name: string; artist_name: string; description: string; logo_url: string; location: string;
  phone: string; whatsapp: string; instagram: string; business_email: string; currency: string; timezone: string;
};
export type BookingPrefs = { deposit: number; buffer_minutes: number; open_time: string; close_time: string; step_minutes: number; work_days: number[] };

export const EMPTY_PROFILE: ProfileInput = { business_name: "", artist_name: "", description: "", logo_url: "", location: "", phone: "", whatsapp: "", instagram: "", business_email: "", currency: "NGN", timezone: "Africa/Lagos" };
export const DEFAULT_PREFS: BookingPrefs = { deposit: 0, buffer_minutes: 30, open_time: "09:00", close_time: "18:00", step_minutes: 30, work_days: [1, 2, 3, 4, 5, 6] };

const RESERVED = ["admin", "api", "a", "dashboard", "login", "signup", "studio", "auth", "onboarding", "book", "assistant", "www", "support", "help"];

/* "Glow by Ada!" -> "glow-by-ada". Used for the artist's booking link. */
export function slugify(input: string): string {
  const base = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
  const s = base.length >= 2 ? base : "artist";
  return RESERVED.includes(s) ? `${s}-makeup` : s;
}
export const cleanInstagram = (s: string) => s.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "");
export const cleanWhatsapp = (s: string) => s.replace(/\D/g, "");
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/, CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

type Result<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> };

export function validateProfile(p: ProfileInput): Result<ProfileInput> {
  const e: Record<string, string> = {}, t = (s: string) => (s ?? "").trim();
  const v: ProfileInput = { business_name: t(p.business_name), artist_name: t(p.artist_name), description: t(p.description), logo_url: t(p.logo_url), location: t(p.location),
    phone: t(p.phone), whatsapp: cleanWhatsapp(p.whatsapp ?? ""), instagram: cleanInstagram(p.instagram ?? ""), business_email: t(p.business_email).toLowerCase(), currency: t(p.currency), timezone: t(p.timezone) };
  if (v.business_name.length < 2 || v.business_name.length > 80) e.business_name = "Please enter your business or brand name (2–80 characters).";
  if (v.artist_name.length < 2 || v.artist_name.length > 80) e.artist_name = "Please enter your name (2–80 characters).";
  if (v.description.length > 500) e.description = "Please keep this under 500 characters.";
  if (v.location.length > 120) e.location = "Please keep this under 120 characters.";
  if (v.phone && (v.phone.replace(/\D/g, "").length < 7 || v.phone.replace(/\D/g, "").length > 15 || !/^[+\d\s()-]+$/.test(v.phone))) e.phone = "Please enter a valid phone number.";
  if (v.whatsapp && (v.whatsapp.length < 8 || v.whatsapp.length > 15 || v.whatsapp.startsWith("0"))) e.whatsapp = "Use the international format, for example +234 801 234 5678.";
  if (v.instagram && !/^[A-Za-z0-9._]{1,30}$/.test(v.instagram)) e.instagram = "Please enter just your Instagram username.";
  if (v.business_email && !EMAIL.test(v.business_email)) e.business_email = "Please enter a valid email address.";
  if (!(CURRENCIES as readonly string[]).includes(v.currency)) e.currency = "Please choose a currency.";
  if (!(TIMEZONES as readonly string[]).includes(v.timezone)) e.timezone = "Please choose a time zone.";
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, value: v };
}

export function validatePrefs(b: BookingPrefs): Result<BookingPrefs> {
  const e: Record<string, string> = {};
  if (!Number.isInteger(b.deposit) || b.deposit < 0 || b.deposit > 10_000_000) e.deposit = "Please enter a whole number, 0 or more.";
  if (!Number.isInteger(b.buffer_minutes) || b.buffer_minutes < 0 || b.buffer_minutes > 240) e.buffer_minutes = "Choose 0 to 240 minutes.";
  if (!CLOCK.test(b.open_time) || !CLOCK.test(b.close_time) || b.open_time >= b.close_time) e.open_time = "Opening time must be before closing time.";
  if (![15, 30, 60].includes(b.step_minutes)) e.step_minutes = "Choose 15, 30 or 60 minutes.";
  if (!Array.isArray(b.work_days) || b.work_days.length === 0 || !b.work_days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) e.work_days = "Choose at least one working day.";
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, value: { ...b, work_days: [...new Set(b.work_days)].sort() } };
}
