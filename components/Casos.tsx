"use client";

import { useEffect, useState } from "react";
import { Beam } from "./Art";
import CardArt, { type ArtKind } from "./CardArt";

const filters = [
  { id: "all", label: "Todos" },
  { id: "re", label: "Real Estate" },
  { id: "sw", label: "Salud & Wellness" },
  { id: "ho", label: "Hospitality" },
  { id: "rt", label: "Retail" },
] as const;

const cases: { cat: string; img: ArtKind; alt: string; kicker: string; title: string; tags: string }[] = [
  { cat: "re", img: "arch", alt: "Arquitectura de concreto en luz dura", kicker: "Real Estate", title: "Terrenos de alto valor", tags: "Estrategia · Marca · Sistema comercial" },
  { cat: "sw", img: "pearl", alt: "Una perla bajo luz de estudio", kicker: "Salud & Wellness", title: "Clínica de medicina estética", tags: "Posicionamiento · Automatización · Crecimiento" },
  { cat: "ho", img: "palm", alt: "Sombra de palmera sobre muro", kicker: "Hospitality", title: "Resort & Members Club", tags: "Marca · Experiencia · Operación" },
];

export default function Casos() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  // the art is drawn with trigonometry: render it after mount so server and browser rounding never disagree
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="sec" id="casos">
      <Beam />
      <div className="wrap shead">
        <p className="eyebrow" data-fade>Casos</p>
        <h2 className="h-section" data-split>
          Resultados que construyen <em>valor real.</em>
        </h2>
        <p className="lead" data-fade>Proyectos donde estrategia, tecnología y creatividad se integran para generar impacto.</p>
        <div className="filters" data-fade role="group" aria-label="Filtrar casos">
          {filters.map((f) => (
            <button key={f.id} className={`chip${filter === f.id ? " is-active" : ""}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="wrap cases">
        {cases.map((c) => (
          <article key={c.title} className={`case${filter !== "all" && filter !== c.cat ? " is-dim" : ""}`}>
            <div className="case__media">
              {mounted ? <CardArt kind={c.img} label={c.alt} /> : null}
            </div>
            <div className="case__body">
              <p className="mono">{c.kicker}</p>
              <h3>{c.title}</h3>
              <p className="case__tags">
                <span>{c.tags}</span>
                <span className="card-arrow" aria-hidden="true">→</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
