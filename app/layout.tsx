import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { PLATFORM } from "@/config/platform";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(PLATFORM.url),
  title: { default: `${PLATFORM.name} | ${PLATFORM.tagline}`, template: `%s | ${PLATFORM.name}` },
  description: PLATFORM.description,
  openGraph: { title: PLATFORM.name, description: PLATFORM.description, type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-ivory font-sans text-base leading-relaxed text-brown antialiased">{children}</body>
    </html>
  );
}
