import type { Metadata, Viewport } from "next";
import { Anybody, Mr_Dafoe, Schibsted_Grotesk } from "next/font/google";
import { copy } from "@/lib/juanras/copy";
import "./juanras.css";

// Anybody carries the idea: its width axis goes from 50 (Lado A, contained) to 150 (Lado B, let loose).
const display = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--jr-font-display" });
const text = Schibsted_Grotesk({ subsets: ["latin"], variable: "--jr-font-text" });
// Stand-in for the band's script wordmark until we have the logo as a vector.
const script = Mr_Dafoe({ subsets: ["latin"], weight: "400", variable: "--jr-font-script" });

export const metadata: Metadata = {
  title: copy.es.meta.title,
  description: copy.es.meta.description,
  // A proposal on BLANK's domain: it must not compete with the band's own site in search.
  robots: { index: false, follow: false },
  openGraph: {
    title: copy.es.meta.title,
    description: copy.es.meta.description,
    images: ["https://juanras.com/imagenes/elegant-live-band.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#000000" };

export default function JuanrasLayout({ children }: { children: React.ReactNode }) {
  return <div className={`jr ${display.variable} ${text.variable} ${script.variable}`}>{children}</div>;
}
