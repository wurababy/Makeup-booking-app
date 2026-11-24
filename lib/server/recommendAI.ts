import type { Look } from "@/data/looks";
import type { FeatureValues, Pick } from "@/lib/recommend";

const SYSTEM = `You help a makeup artist recommend looks to a client. Choose 4 looks (fewer if the catalog is smaller) ONLY from the catalog provided, using the exact "slug" values.
For each, write one kind, specific sentence (max 180 characters) explaining why it suits the client's features. Never mention prices or durations. Never invent looks. Make no medical or skin-condition claims.
If a feature is "Unclear", don't rely on it.
Reply with JSON only: {"picks":[{"slug":"","why":""}]}`;

export async function askForPicks(looks: Look[], f: FeatureValues, skin: string): Promise<Pick[] | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 800, system: SYSTEM,
        messages: [{ role: "user", content: JSON.stringify({ features: f, skin_feel: skin, catalog: looks.map((l) => ({ slug: l.slug, name: l.name, category: l.category, description: l.description })) }) }] }),
    });
    if (!res.ok) return null;
    const text: string = (await res.json())?.content?.find((c: { type: string }) => c.type === "text")?.text ?? "";
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    const picks = JSON.parse(text.slice(a, b + 1))?.picks;
    return Array.isArray(picks) ? picks : null;
  } catch { return null; }
}
