import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { PLATFORM } from "@/config/platform";
import { getCatalog } from "@/lib/server/looks";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { looks } = await getCatalog();
  const pages = ["", "/signup", "/login"].map((p) => ({ url: `${PLATFORM.url}${p}` })).concat(["/studio", "/assistant", "/book", "/policies", "/privacy"].map((p) => ({ url: `${SITE.url}${p}` })));
  return [...pages, ...looks.map((l) => ({ url: `${SITE.url}/looks/${l.slug}` }))];
}
