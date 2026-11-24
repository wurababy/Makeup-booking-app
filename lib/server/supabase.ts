import { createClient } from "@supabase/supabase-js";

/* Server-only client using the secret service-role key. Never import this from a component. */
export function db() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
export const PHOTO_BUCKET = "client-photos";
