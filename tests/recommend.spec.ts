import { test } from "node:test";
import assert from "node:assert/strict";
import { mergePicks, fallbackPicks, whyFor, type FeatureValues } from "../lib/recommend";
import { LOOKS } from "../data/looks";

const F: FeatureValues = { shape: "Oval", eyes: "Almond", lips: "Full", jaw: "Soft", cheeks: "High", proportions: "Balanced" };
const slugs = new Set(LOOKS.map((l) => l.slug));

test("AI picks with unknown slugs are dropped", () => {
  const r = mergePicks(LOOKS, [{ slug: "made-up-look", why: "x" }, { slug: "soft-glam", why: "Lovely." }], F);
  assert.ok(r.every((p) => slugs.has(p.slug))); assert.ok(!r.some((p) => p.slug === "made-up-look"));
});
test("repeated slugs are removed and the list never exceeds four", () => {
  const ai = LOOKS.map((l) => ({ slug: l.slug, why: "ok" })).concat({ slug: "soft-glam", why: "again" });
  const r = mergePicks(LOOKS, ai, F); assert.ok(r.length <= 4); assert.equal(new Set(r.map((p) => p.slug)).size, r.length);
});
test("a missing or failed AI still gives three valid looks", () => {
  for (const ai of [null, [], [{ slug: "nope", why: "" }]]) { const r = mergePicks(LOOKS, ai as never, F); assert.equal(r.length, 3); assert.ok(r.every((p) => slugs.has(p.slug) && p.why.length > 0)); }
});
test("an empty explanation is replaced with a safe one", () => assert.ok(mergePicks(LOOKS, [{ slug: "soft-glam", why: "  " }], F)[0].why.length > 10));
test("small catalogs are respected", () => { const r = mergePicks(LOOKS.slice(0, 2), null, F); assert.equal(r.length, 2); });
test("unclear features never produce odd wording", () => {
  const w = whyFor(LOOKS[0], { ...F, shape: "Unclear", eyes: "Unclear" }); assert.ok(!w.includes("unclear")); assert.ok(w.includes("your face shape"));
});
test("fallback is deterministic", () => assert.deepEqual(fallbackPicks(LOOKS, F), fallbackPicks(LOOKS, F)));
