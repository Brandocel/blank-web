"use client";

import { useSite } from "./Site";

export default function Nav() {
  const { t, lang, setLang } = useSite();
  return (
    <header className="jr-nav">
      <a href="#top" className="jr-nav__mark">The Juanras</a>
      <nav className="jr-nav__links" aria-label={lang === "es" ? "Principal" : "Main"}>
        <a href="#musicos" className="jr-nav__link">{t.nav.musicians}</a>
        <button type="button" className="jr-nav__link" onClick={() => setLang(lang === "es" ? "en" : "es")} aria-label={t.nav.lang} lang={lang === "es" ? "en" : "es"}>
          {lang === "es" ? "EN" : "ES"}
        </button>
        <a href="#contratar" className="jr-nav__cta">{t.nav.book}</a>
      </nav>
    </header>
  );
}
