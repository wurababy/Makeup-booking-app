"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { slugify, validatePrefs, validateProfile, type BookingPrefs, type ProfileInput } from "@/lib/profile";

type R = { ok: boolean; error?: string; errors?: Record<string, string> };
const cols = (v: ProfileInput) => ({ business_name: v.business_name, artist_name: v.artist_name, description: v.description || null, logo_url: v.logo_url || null, location: v.location || null,
  phone: v.phone || null, whatsapp: v.whatsapp || null, instagram: v.instagram || null, business_email: v.business_email || null, currency: v.currency, timezone: v.timezone });

/* Runs on the server AS THE SIGNED-IN USER, so the database rules (RLS) apply. Creates the artist on first save, updates afterwards. */
export async function saveProfile(input: { profile: ProfileInput; prefs?: BookingPrefs; complete?: boolean }): Promise<R> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const v = validateProfile(input.profile);
  if (!v.ok) return { ok: false, errors: v.errors };
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artist-assets/${user.id}/`;
  if (v.value.logo_url && !v.value.logo_url.startsWith(prefix)) return { ok: false, error: "That logo isn’t valid. Please upload it again." };
  let prefs: BookingPrefs | undefined;
  if (input.prefs) { const p = validatePrefs(input.prefs); if (!p.ok) return { ok: false, errors: p.errors }; prefs = p.value; }

  const { data: existing } = await sb.from("artists").select("id").eq("user_id", user.id).maybeSingle();
  let id = existing?.id as string | undefined;
  if (id) {
    const { error } = await sb.from("artists").update({ ...cols(v.value), ...(input.complete ? { onboarding_completed: true } : {}) }).eq("id", id);
    if (error) return { ok: false, error: "Couldn’t save. Please try again." };
  } else {
    const base = slugify(v.value.business_name);
    for (let i = 0; i < 6 && !id; i++) {
      const slug = i === 0 ? base : `${base}-${randomBytes(2).toString("hex")}`;
      const { data, error } = await sb.from("artists").insert({ user_id: user.id, slug, ...cols(v.value) }).select("id").single();
      if (data) id = data.id;
      else if (error?.message?.includes("user_id")) id = (await sb.from("artists").select("id").eq("user_id", user.id).maybeSingle()).data?.id; /* double-click: already created */
      else if (error?.code !== "23505") return { ok: false, error: "Couldn’t create your studio. Please try again." };
    }
    if (!id) return { ok: false, error: "Couldn’t find a free booking link. Please try a slightly different brand name." };
    if (input.complete) await sb.from("artists").update({ onboarding_completed: true }).eq("id", id);
  }
  if (prefs) {
    const { error } = await sb.from("availability_settings").update(prefs).eq("artist_id", id);
    if (error) return { ok: false, error: "Couldn’t save your booking preferences." };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function completeOnboarding(): Promise<R> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in again." };
  const { data } = await sb.from("artists").update({ onboarding_completed: true }).eq("user_id", user.id).select("id");
  if (!data?.length) return { ok: false, error: "Please complete the first step first." };
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
