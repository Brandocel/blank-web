"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import Wordmark from "./Wordmark";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");

  // Scroll spy: underline the section the reader is in.
  useEffect(() => {
    const ids = nav.map((l) => l.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < window.innerHeight * 0.6) return setActive("");
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const top = () => window.scrollY < window.innerHeight * 0.6 && setActive("");
    window.addEventListener("scroll", top, { passive: true });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", top);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="nav__bar">
        <a href="#top" className="logo" aria-label="BLANK inicio" onClick={close}>
          <Wordmark name="BLANK" title="BLANK inicio" />
        </a>
        <nav className="nav__links" aria-label="Principal">
          {nav.map((l) => (
            <a key={l.href} href={l.href} aria-current={active === l.href.slice(1) ? "true" : undefined}>{l.label}</a>
          ))}
        </nav>
        <div className="nav__cta">
          <a href="/demo" className="btn btn--ghost btn--sm hide-sm">Probar NØDE</a>
          <a href="#registro" className="btn btn--ghost btn--sm hide-sm">Registrarse</a>
          <a href="#demo" className="btn btn--outline btn--sm">
            Agendar conversación <span aria-hidden="true">↗</span>
          </a>
          <button
            className="burger"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span /><span />
          </button>
        </div>
      </div>
      <div className="mobile-menu" id="mobile-menu" hidden={!open}>
        {nav.map((l) => (
          <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
        ))}
        <a href="/demo" onClick={close}>Probar NØDE en vivo</a>
        <div className="mobile-menu__cta">
          <a href="#escribir" className="btn btn--ghost" onClick={close}>Escribir</a>
          <a href="#registro" className="btn btn--ghost" onClick={close}>Registrarse</a>
          <a href="#demo" className="btn btn--light" onClick={close}>Agendar demo</a>
        </div>
      </div>
    </header>
  );
}
