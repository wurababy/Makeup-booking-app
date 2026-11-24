import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_token";

/* Returns the signed-in admin, or null. The token is checked with Supabase Auth on every request,
   and the email must be on the ADMIN_EMAILS list, so a client can't sign themselves in as admin. */
export async function adminUser(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const url = process.env.SUPABASE_URL, anon = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!r.ok) return null;
  const u = await r.json();
  const allow = (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  return u?.email && allow.includes(String(u.email).toLowerCase()) ? { email: u.email } : null;
}
