import { NextResponse } from "next/server";
import { FEATURES, SKIN_FEEL } from "@/lib/features";
import { mergePicks, type FeatureValues, type RecCard } from "@/lib/recommend";
import { askForPicks } from "@/lib/server/recommendAI";
import { getCatalog } from "@/lib/server/looks";
import { allowed } from "@/lib/server/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowed(ip, 20)) return NextResponse.json({ ok: false, error: "Please try again in a little while." }, { status: 429 });
  const b = await req.json().catch(() => null);
  const f = {} as FeatureValues;
  for (const x of FEATURES) { const v = b?.features?.[x.key]; f[x.key] = typeof v === "string" && (x.options.includes(v) || v === "Unclear") ? v : "Unclear"; }
  const skin = SKIN_FEEL.includes(b?.skinFeel) ? b.skinFeel : "Not sure";

  const { looks } = await getCatalog(); /* recommendations only ever come from your own looks */
  if (!looks.length) return NextResponse.json({ ok: false, error: "No looks are available yet." }, { status: 503 });
  const picks = mergePicks(looks, await askForPicks(looks, f, skin), f);
  const recs: RecCard[] = picks.map((p) => { const l = looks.find((x) => x.slug === p.slug)!; /* name, price, duration, photo always come from your data */
    return { slug: l.slug, name: l.name, description: l.description, why: p.why, price: l.price, minutes: l.minutes, photo: l.photo }; });
  return NextResponse.json({ ok: true, recs });
}
