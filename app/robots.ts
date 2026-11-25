import type { MetadataRoute } from "next";
import { PLATFORM } from "@/config/platform";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dashboard", "/onboarding", "/auth/", "/book/confirmation"] }, sitemap: `${PLATFORM.url}/sitemap.xml` };
}
