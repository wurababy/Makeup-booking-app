import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { assessPhotos, type PhotoInput } from "@/lib/server/assess";
import { db, PHOTO_BUCKET } from "@/lib/server/supabase";
import { allowed } from "@/lib/server/rateLimit";
import { MAX_PHOTO_BYTES } from "@/lib/features";

export const runtime = "nodejs";
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const fail = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip)) return fail("You’ve tried a few times already. Please try again later.", 429);

  const form = await req.formData();
  if (form.get("consent") !== "yes") return fail("Please agree to the photo notice first.");
  const keep = form.get("keep") === "yes";

  const slots = [["front", "Front-facing"], ["left", "Left profile"], ["right", "Right profile"]] as const;
  const files: { key: string; label: string; file: File }[] = [];
  for (const [key, label] of slots) {
    const f = form.get(key);
    if (f instanceof File && f.size > 0) {
      if (!TYPES.includes(f.type)) return fail("Please upload JPG, PNG or WebP photos.");
      if (f.size > MAX_PHOTO_BYTES) return fail("One of your photos is too large. Please try a smaller one.");
      files.push({ key, label, file: f });
    }
  }
  if (!files.some((f) => f.key === "front")) return fail("A front-facing photo is needed.");
  const supabase = db();
  if (keep && !supabase) return fail("Saving photos isn’t available right now. You can continue without saving them.", 503);

  const buffers = await Promise.all(files.map(async (f) => Buffer.from(await f.file.arrayBuffer())));
  let assessment;
  try {
    const photos: PhotoInput[] = files.map((f, i) => ({ label: f.label, base64: buffers[i].toString("base64"), mediaType: f.file.type }));
    assessment = await assessPhotos(photos); /* photos exist only in memory here unless "keep" was chosen */
  } catch (e) {
    const code = e instanceof Error ? e.message : "";
    return fail(code === "AI_NOT_CONFIGURED" ? "The beauty assistant isn’t switched on yet." : "Something went wrong analysing your photos. Please try again.", 502);
  }
  if (!assessment.faceDetected) return fail("I couldn’t see a clear face in your front photo. Please try a bright, front-facing photo.", 422);

  let assessmentId: string | undefined, deleteToken: string | undefined;
  if (keep && supabase) {
    const id = randomUUID(), token = randomBytes(32).toString("hex"), paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const path = `${id}/${files[i].key}`;
      const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, buffers[i], { contentType: files[i].file.type });
      if (up.error) { await supabase.storage.from(PHOTO_BUCKET).remove(paths); return fail("We couldn’t save your photos. You can continue without saving them.", 500); }
      paths.push(path);
    }
    const ins = await supabase.from("assessments").insert({ id, delete_token_hash: createHash("sha256").update(token).digest("hex"), photo_paths: paths, result: assessment });
    if (ins.error) { await supabase.storage.from(PHOTO_BUCKET).remove(paths); return fail("We couldn’t save your photos. You can continue without saving them.", 500); }
    assessmentId = id; deleteToken = token;
  }
  return NextResponse.json({ ok: true, assessment, assessmentId, deleteToken });
}
