import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/* Email links (verify email, reset password) land here and become a signed-in session. */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const code = q.get("code"), tokenHash = q.get("token_hash"), type = q.get("type") as EmailOtpType | null;
  const next = q.get("next") ?? "/dashboard";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"; /* never redirect off-site */
  const sb = await supabaseServer();
  let failed = true;
  if (code) failed = !!(await sb.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) failed = !!(await sb.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  return NextResponse.redirect(new URL(failed ? "/login?error=link" : safe, req.url));
}
