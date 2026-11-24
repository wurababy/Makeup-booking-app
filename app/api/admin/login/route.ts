import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/server/admin";
import { allowed } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip, 10)) return NextResponse.json({ ok: false, error: "Too many attempts. Please wait a while." }, { status: 429 });
  const b = await req.json().catch(() => null);
  const url = process.env.SUPABASE_URL, anon = process.env.SUPABASE_ANON_KEY;
  const bad = NextResponse.json({ ok: false, error: "That email or password isn’t right." }, { status: 401 });
  if (!url || !anon || typeof b?.email !== "string" || typeof b?.password !== "string") return bad;
  const allow = (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim());
  if (!allow.includes(b.email.trim().toLowerCase())) return bad;
  const r = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: anon, "content-type": "application/json" }, body: JSON.stringify({ email: b.email.trim(), password: b.password }) });
  const j = await r.json().catch(() => null);
  if (!r.ok || !j?.access_token) return bad;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, j.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: Math.min(j.expires_in ?? 3600, 3600) });
  return res;
}
