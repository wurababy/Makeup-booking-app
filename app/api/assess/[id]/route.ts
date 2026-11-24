import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { db, PHOTO_BUCKET } from "@/lib/server/supabase";

export const runtime = "nodejs";

/* Lets a client delete their own saved photos, using the private token they were given. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("x-delete-token") ?? "";
  const supabase = db();
  if (!supabase || !/^[0-9a-f-]{36}$/.test(id) || !token) return NextResponse.json({ ok: false }, { status: 400 });
  const { data } = await supabase.from("assessments").select("delete_token_hash, photo_paths").eq("id", id).single();
  const given = createHash("sha256").update(token).digest();
  const stored = Buffer.from(data?.delete_token_hash ?? "", "hex");
  if (!data || stored.length !== given.length || !timingSafeEqual(stored, given)) return NextResponse.json({ ok: false }, { status: 403 });
  await supabase.storage.from(PHOTO_BUCKET).remove(data.photo_paths as string[]);
  await supabase.from("assessments").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
