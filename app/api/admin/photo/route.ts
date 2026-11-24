import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminUser } from "@/lib/server/admin";
import { db } from "@/lib/server/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await adminUser())) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  const sb = db(), form = await req.formData(), file = form.get("file"), id = String(form.get("id") ?? "");
  if (!sb || !(file instanceof File) || !/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4_000_000) return NextResponse.json({ ok: false, error: "Please use a JPG, PNG or WebP photo under 4 MB." }, { status: 400 });
  const path = `${id}-${Date.now()}.jpg`;
  const up = await sb.storage.from("look-photos").upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (up.error) return NextResponse.json({ ok: false, error: "Upload failed." }, { status: 500 });
  const url = sb.storage.from("look-photos").getPublicUrl(path).data.publicUrl;
  await sb.from("looks").update({ photo_url: url }).eq("id", id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, url });
}
