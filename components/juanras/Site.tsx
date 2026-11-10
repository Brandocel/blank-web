"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { copy, type Copy, type Lang } from "@/lib/juanras/copy";
import Nav from "./Nav";
import Hero from "./Hero";
import Intro from "./Intro";
import SideA from "./SideA";
import Flip from "./Flip";
import SideB from "./SideB";
import Stage from "./Stage";
import Booking from "./Booking";
import Musicians from "./Musicians";
import Footer from "./Footer";
import Motion from "./Motion";

type Ctx = { lang: Lang; t: Copy; setLang: (l: Lang) => void };
const SiteCtx = createContext<Ctx | null>(null);

export function useSite() {
  const v = useContext(SiteCtx);
  if (!v) throw new Error("useSite outside <Site>");
  return v;
}

export default function Site() {
  const [lang, setLangState] = useState<Lang>("es");
  const t = copy[lang];

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("jr-lang");
    } catch {}
    if (saved === "en" || (!saved && !navigator.language.toLowerCase().startsWith("es"))) setLangState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.meta.title;
  }, [lang, t]);

  const setLang = (l: Lang) => {
    try {
      localStorage.setItem("jr-lang", l);
    } catch {}
    setLangState(l);
  };

  return (
    <SiteCtx.Provider value={{ lang, t, setLang }}>
      {/* Keyed by language so pinned sections and split titles are rebuilt from clean markup. */}
      <div key={lang}>
        <a className="jr-skip" href="#jr-main">{t.skip}</a>
        <Nav />
        <main id="jr-main">
          <Hero />
          <Intro />
          <SideA />
          <Flip />
          <SideB />
          <Stage />
          <Booking />
          <Musicians />
        </main>
        <Footer />
        <Motion />
      </div>
    </SiteCtx.Provider>
  );
}
