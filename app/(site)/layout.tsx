import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE } from "@/config/site";

/* Layout of the original single-studio site (now at /studio). */
export const metadata: Metadata = {
  title: { default: `${SITE.name} | Makeup Artistry`, template: `%s | ${SITE.name}` },
  description: SITE.description,
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (<><Nav />{children}<Footer /></>);
}
