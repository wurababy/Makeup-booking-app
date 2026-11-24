import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Your Studio Name | Makeup Artistry",
  description: "Bridal, soft glam and natural makeup artistry. Discover your perfect look and book online.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-ivory font-sans text-base leading-relaxed text-brown antialiased">
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
