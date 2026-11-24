import { NextResponse } from "next/server";
import { db, PHOTO_BUCKET } from "@/lib/server/supabase";

export const runtime = "nodejs";

/* Runs daily (see vercel.json): deletes saved assessment photos older than 30 days. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse("Unauthorized", { status: 401 });
  const sb = db();
  if (!sb) return NextResponse.json({ ok: false }, { status: 503 });
  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await sb.from("assessments").select("id, photo_paths").lt("created_at", cutoff);
  for (const a of data ?? []) { await sb.storage.from(PHOTO_BUCKET).remove(a.photo_paths as string[]); await sb.from("assessments").delete().eq("id", a.id); }
  return NextResponse.json({ ok: true, deleted: data?.length ?? 0 });
}
