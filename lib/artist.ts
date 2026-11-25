import { supabaseServer } from "./supabase/server";

export type ArtistRow = {
  id: string; user_id: string; slug: string; business_name: string; artist_name: string; description: string | null; logo_url: string | null;
  location: string | null; phone: string | null; whatsapp: string | null; instagram: string | null; business_email: string | null;
  currency: string; timezone: string; onboarding_completed: boolean; plan: string; status: string;
};

/* Who is signed in, and which artist business they own. Reads go through RLS, so only their own row can ever come back. */
export async function getArtistContext() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, user: null, artist: null as ArtistRow | null };
  const { data } = await sb.from("artists").select("*").eq("user_id", user.id).maybeSingle();
  return { sb, user, artist: (data as ArtistRow | null) };
}

import { DEFAULT_PREFS, type BookingPrefs, type ProfileInput } from "./profile";
export const toProfile = (a: ArtistRow): ProfileInput => ({ business_name: a.business_name, artist_name: a.artist_name, description: a.description ?? "", logo_url: a.logo_url ?? "", location: a.location ?? "",
  phone: a.phone ?? "", whatsapp: a.whatsapp ?? "", instagram: a.instagram ?? "", business_email: a.business_email ?? "", currency: a.currency, timezone: a.timezone });
export async function getPrefs(artistId: string | undefined): Promise<BookingPrefs> {
  if (!artistId) return DEFAULT_PREFS;
  const sb = await supabaseServer();
  const { data: s } = await sb.from("availability_settings").select("*").eq("artist_id", artistId).maybeSingle();
  return s ? { deposit: s.deposit, buffer_minutes: s.buffer_minutes, open_time: s.open_time, close_time: s.close_time, step_minutes: s.step_minutes, work_days: s.work_days } : DEFAULT_PREFS;
}
