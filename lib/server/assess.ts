import { FEATURES, type Assessment, type Confidence, type FeatureKey } from "@/lib/features";

const SYSTEM = `You are a friendly, kind makeup-artist assistant. You look at face photos ONLY to help choose flattering makeup.
Rules:
- Describe only visible features relevant to makeup. Never comment on identity, age, ethnicity, health, weight or attractiveness.
- Never diagnose skin type or skin conditions. For skin, only note neutral visible observations (for example "lighting makes skin tone hard to judge").
- If a feature cannot be judged reliably (angle, lighting, hair, filters, heavy makeup, missing side photo), use the value "Unclear" with confidence "low" and say why.
- Be gentle and positive in every note. Keep each note under 160 characters.
- If no clear human face is visible in the front photo, return {"face_detected": false}.
Reply with JSON only, no other text, in exactly this shape:
{"face_detected":true,"photo_quality_note":"string","features":{"shape":{"value":"","confidence":"high|medium|low","note":""},"eyes":{...},"lips":{...},"jaw":{...},"cheeks":{...},"proportions":{...}},"skin_observations":"string"}
Allowed values:
${FEATURES.map((f) => `${f.key}: ${f.options.join(", ")}, Unclear`).join("\n")}`;

export type PhotoInput = { label: string; base64: string; mediaType: string };

export async function assessPhotos(photos: PhotoInput[]): Promise<Assessment> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("AI_NOT_CONFIGURED");
  const content: unknown[] = [];
  for (const p of photos) {
    content.push({ type: "text", text: `${p.label} photo:` });
    content.push({ type: "image", source: { type: "base64", media_type: p.mediaType, data: p.base64 } });
  }
  content.push({ type: "text", text: photos.length === 1 ? "Only a front photo was provided, so jawline and cheekbones should be low confidence." : "Please assess." });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 1200, system: SYSTEM, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) throw new Error("AI_FAILED");
  const data = await res.json();
  const text: string = data?.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("AI_BAD_REPLY");
  let raw: any;
  try { raw = JSON.parse(text.slice(start, end + 1)); } catch { throw new Error("AI_BAD_REPLY"); }
  return validate(raw);
}

/* Never trust the model's output: keep only allowed values. */
function validate(raw: any): Assessment {
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const conf = (v: unknown): Confidence => (v === "high" || v === "medium" ? v : "low");
  const features = {} as Assessment["features"];
  for (const f of FEATURES) {
    const r = raw?.features?.[f.key];
    const ok = typeof r?.value === "string" && f.options.includes(r.value);
    features[f.key as FeatureKey] = { value: ok ? r.value : "Unclear", confidence: ok ? conf(r?.confidence) : "low", note: str(r?.note, 200) };
  }
  return { faceDetected: raw?.face_detected !== false, photoNote: str(raw?.photo_quality_note, 240), features, skinObservations: str(raw?.skin_observations, 300) };
}
