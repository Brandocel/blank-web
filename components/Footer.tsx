"use client";

import { useState } from "react";
import { formToFields, submitLead } from "@/lib/leads";
import Wordmark from "./Wordmark";

const cols = [
  { title: "Ecosistema", links: [["#ecosistema", "BLANK"], ["#node", "NØDE"], ["#grid", "GRID"]] },
  { title: "Compañía", links: [["#proposito", "Propósito"], ["#proceso", "Proceso"], ["#casos", "Casos"], ["#principios", "Principios"]] },
  { title: "Contacto", links: [["#demo", "Agendar demo"], ["#registro", "Registrarse"], ["#escribir", "Escribir"]] },
];

export default function Footer() {
  const [state, setState] = useState<{ ok?: boolean; error?: string; busy?: boolean }>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState({ busy: true });
    const res = await submitLead({ type: "newsletter", fields: formToFields(form) });
    if (res.ok) {
      form.reset();
      setState({ ok: true });
    } else setState({ error: res.error });
  }

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <form className="subscribe" id="suscribir" noValidate onSubmit={onSubmit}>
            <p className="eyebrow">Insights</p>
            <p className="subscribe__title">Recibe nuestro mejor pensamiento sobre estrategia, tecnología y marca.</p>
            {state.ok ? (
              <p className="subscribe__ok" role="status">Gracias. Te escribiremos pronto.</p>
            ) : (
              <>
                <div className="subscribe__row">
                  <label className="sr-only" htmlFor="n-email">Correo</label>
                  <input id="n-email" name="correo" type="email" placeholder="tu@correo.com" autoComplete="email" required />
                  <button className="btn btn--light" type="submit" disabled={state.busy}>{state.busy ? "…" : "Suscribirme"}</button>
                </div>
                <div className="hp" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
                <p className="form__error" role="alert">{state.error}</p>
              </>
            )}
          </form>
          <nav className="footer__nav" aria-label="Pie de página">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mono">{c.title}</p>
                {c.links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
              </div>
            ))}
          </nav>
        </div>
        <div className="footer__lockup" aria-label="BLANK, NØDE y GRID">
          <Wordmark name="BLANK" />
          <i aria-hidden="true" />
          <Wordmark name="NØDE" />
          <i aria-hidden="true" />
          <Wordmark name="GRID" />
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} BLANK. The space before intelligence.</span>
          <span>Estrategia / Tecnología / Marca / Comunicación / Sistemas</span>
        </div>
      </div>
    </footer>
  );
}
