import { LOOKS as STATIC, CATEGORIES, type Look } from "@/data/looks";
import { db } from "./supabase";

/* The website reads looks from the database. Until you add looks in the admin dashboard it shows the starter list. */
export async function getCatalog(): Promise<{ looks: Look[]; categories: string[]; fromDb: boolean }> {
  const sb = db();
  if (sb) {
    const [l, c] = await Promise.all([sb.from("looks").select("*").eq("active", true).order("created_at"), sb.from("categories").select("name").order("sort").order("name")]);
    if (l.data?.length) return {
      fromDb: true, categories: (c.data ?? []).map((x) => x.name as string),
      looks: l.data.map((r) => ({ slug: r.slug, name: r.name, category: r.category, description: r.description, price: r.price, minutes: r.minutes, photo: r.photo_url ?? undefined })),
    };
  }
  return { looks: STATIC, categories: [...CATEGORIES], fromDb: false };
}
export async function getDeposit() {
  const sb = db();
  const { data } = sb ? await sb.from("settings").select("deposit").eq("id", 1).single() : { data: null };
  return (data?.deposit as number | undefined) ?? 15000;
}
