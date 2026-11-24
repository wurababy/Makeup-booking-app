import type { FeatureKey } from "./features";
import type { Look } from "../data/looks";

export type FeatureValues = Record<FeatureKey, string>;
export type Pick = { slug: string; why: string };
export type RecCard = { slug: string; name: string; description: string; why: string; price: number; minutes: number; photo?: string };

const known = (v: string) => v && v !== "Unclear";
const WHY: Record<string, (s: string, e: string) => string> = {
  "Soft Glam": (s, e) => `Soft, diffused tones balance ${s} and keep ${e} as the focus.`,
  "Full Glam": (s, e) => `Defined, sculpted makeup brings out ${s} and makes ${e} stand out.`,
  Bridal: (s) => `A luminous, long-wear finish complements ${s} and photographs beautifully.`,
  Birthday: (s, e) => `A radiant, celebratory finish that flatters ${s} and ${e}.`,
  Natural: (s, e) => `Skin-first makeup lets ${s} and ${e} shine without covering your features.`,
  Traditional: (s, e) => `Rich, elegant colour suits ${s} and frames ${e}.`,
  Editorial: (s, e) => `Creative colour and shape make the most of ${s} and ${e}.`,
};
export function whyFor(look: Look, f: FeatureValues): string {
  const s = known(f.shape) ? `your ${f.shape.toLowerCase()} face shape` : "your face shape";
  const e = known(f.eyes) ? `your ${f.eyes.toLowerCase()} eyes` : "your eyes";
  return (WHY[look.category] ?? ((a, b) => `A lovely match for ${a} and ${b}.`))(s, e);
}

/* Used when the AI is unavailable or gives an unusable answer. Only ever picks looks from the catalog. */
export function fallbackPicks(looks: Look[], f: FeatureValues): Pick[] {
  const seed = [...JSON.stringify(f)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const cats = [...new Set(looks.map((l) => l.category))];
  const r = cats.length ? seed % cats.length : 0;
  const order = [...cats.slice(r), ...cats.slice(0, r)];
  const picks: Look[] = [];
  for (const c of order) { const m = looks.filter((l) => l.category === c); if (m.length && picks.length < 4) picks.push(m[seed % m.length]); }
  for (const l of looks) if (picks.length < 4 && !picks.includes(l)) picks.push(l);
  return picks.map((l) => ({ slug: l.slug, why: whyFor(l, f) }));
}

/* Trust nothing from the AI except the choice of slug: unknown or repeated slugs are dropped, and the list is topped up if short. */
export function mergePicks(looks: Look[], ai: Pick[] | null, f: FeatureValues): Pick[] {
  const bySlug = new Map(looks.map((l) => [l.slug, l]));
  const out: Pick[] = [], seen = new Set<string>();
  for (const p of ai ?? []) {
    if (out.length >= 4 || typeof p?.slug !== "string" || !bySlug.has(p.slug) || seen.has(p.slug)) continue;
    seen.add(p.slug);
    const why = typeof p.why === "string" && p.why.trim() ? p.why.trim().slice(0, 220) : whyFor(bySlug.get(p.slug)!, f);
    out.push({ slug: p.slug, why });
  }
  const want = Math.min(3, looks.length);
  if (out.length < want) for (const p of fallbackPicks(looks, f)) { if (out.length >= want) break; if (!seen.has(p.slug)) { seen.add(p.slug); out.push(p); } }
  return out;
}
