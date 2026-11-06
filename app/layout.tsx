import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { site } from "@/lib/site";
import "@/components/iso/iso.css";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const wide = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-wide" });

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: "Diseñamos la inteligencia detrás de negocios ambiciosos.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#050505" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // "js" hides animated elements before first paint (globals.css). Motion adds "motion-ready" and takes over;
  // if it never does, a CSS fallback shows everything after 4 s, and reduced motion never hides anything.
  return (
    <html lang="es" className={`js ${sans.variable} ${mono.variable} ${serif.variable} ${wide.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
