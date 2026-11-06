"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formToFields, submitLead, validateLead, type LeadType } from "@/lib/leads";
import { formatPhone, site, whatsappLink } from "@/lib/site";
import { buildIcs, cdmxNow, dayLabel, isoDate, SLOTS } from "@/lib/calendar";

type Tab = "demo" | "registro" | "escribir";
const TABS: { id: Tab; label: string }[] = [
  { id: "demo", label: "Agendar demo" },
  { id: "registro", label: "Registrarse" },
  { id: "escribir", label: "Escribir" },
];
const PRODUCTS = [
  { v: "NØDE", sub: "Personal" },
  { v: "GRID", sub: "Empresa" },
  { v: "Consultoría BLANK", label: "BLANK", sub: "Consultoría" },
];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MAX_DAYS_AHEAD = 60;

type Success = { title: string; text: string; ics?: string };

const Honeypot = () => (
  <div className="hp" aria-hidden="true">
    <label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label>
  </div>
);

export default function ContactHub() {
  const [tab, setTab] = useState<Tab>("demo");
  const [product, setProduct] = useState("NØDE");
  const [plan, setPlan] = useState<"node" | "grid">("node");
  const [success, setSuccess] = useState<Success | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Tab, string>>>({});
  const [busy, setBusy] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Hash routing (#demo, #registro, #escribir) + data-product / data-plan links anywhere on the page.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.some((t) => t.id === h)) {
        setTab(h);
        setSuccess(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-product],[data-plan]");
      if (!a) return;
      if (a.dataset.product) setProduct(a.dataset.product);
      if (a.dataset.plan === "node" || a.dataset.plan === "grid") setPlan(a.dataset.plan);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (success) successRef.current?.focus();
  }, [success]);

  const selectTab = (t: Tab) => {
    setTab(t);
    setSuccess(null);
    history.replaceState(null, "", `#${t}`);
  };

  const onTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    if (e.key === "ArrowLeft") n = (i + TABS.length - 1) % TABS.length;
    if (n < 0) return;
    e.preventDefault();
    selectTab(TABS[n].id);
    document.getElementById(`tab-${TABS[n].id}`)?.focus();
  };

  const send = useCallback(
    async (e: React.FormEvent<HTMLFormElement>, tabId: Tab, type: LeadType, done: (f: Record<string, string>) => Success) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fields = formToFields(form);
      const err = validateLead({ type, fields });
      if (err) {
        setErrors((s) => ({ ...s, [tabId]: err }));
        const firstEmpty = Array.from(form.querySelectorAll<HTMLInputElement>("input[required],textarea[required]")).find((el) =>
          el.type === "checkbox" ? !el.checked : !el.value.trim(),
        );
        firstEmpty?.focus();
        return;
      }
      setErrors((s) => ({ ...s, [tabId]: "" }));
      setBusy(true);
      const res = await submitLead({ type, fields });
      setBusy(false);
      if (!res.ok) {
        setErrors((s) => ({ ...s, [tabId]: res.error }));
        return;
      }
      form.reset();
      setSuccess(done(fields));
    },
    [],
  );

  return (
    <section className="section hub" id="contacto">
      <span className="anchor" id="demo" />
      <span className="anchor" id="registro" />
      <span className="anchor" id="escribir" />
      <div className="wrap">
        <div className="hub__head">
          <p className="chapter__num" data-fade>Empecemos</p>
          <h2 className="hub__title" data-split>
            Todo empieza
            <br />
            en <em>blanco.</em>
          </h2>
          <p className="chapter__lead" data-fade>Elige cómo empezar.</p>
        </div>

        <div className="hub__panel" data-rise>
          <div className="tabs" role="tablist" aria-label="Opciones de contacto" onKeyDown={onTabKey}>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-controls={`panel-${t.id}`}
                aria-selected={tab === t.id}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => selectTab(t.id)}
              >
                <span className="mono">0{i + 1}</span>
                {t.label}
              </button>
            ))}
          </div>

          {success ? (
            <div className="success" ref={successRef} tabIndex={-1} role="status">
              <div className="success__mark" aria-hidden="true"><span /></div>
              <h3 className="h3">{success.title}</h3>
              <p>{success.text}</p>
              <div className="row row--center">
                {success.ics && (
                  <a className="btn btn--ghost" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(success.ics)}`} download="demo-blank.ics">
                    Añadir a mi calendario
                  </a>
                )}
                <button type="button" className="btn btn--light" onClick={() => setSuccess(null)}>Volver</button>
              </div>
            </div>
          ) : (
            <>
              <div role="tabpanel" id="panel-demo" aria-labelledby="tab-demo" className="panel" hidden={tab !== "demo"}>
                <DemoForm
                  product={product}
                  setProduct={setProduct}
                  error={errors.demo}
                  busy={busy}
                  onSubmit={(e) =>
                    send(e, "demo", "demo", (f) => ({
                      title: "Demo solicitada.",
                      text: `Tu demo de ${f.producto} quedó apartada para el ${dayLabel(f.fecha)} a las ${f.hora} (hora CDMX). Te enviaremos la confirmación a ${f.correo}.`,
                      ics: buildIcs(f.fecha, f.hora, `Demo ${f.producto} · BLANK`, `${f.formato || "Videollamada"} con el equipo de BLANK.`),
                    }))
                  }
                />
              </div>

              <div role="tabpanel" id="panel-registro" aria-labelledby="tab-registro" className="panel" hidden={tab !== "registro"}>
                <form className="form form--narrow" noValidate onSubmit={(e) =>
                  send(e, "registro", "registro", (f) => ({
                    title: f.plan === "grid" ? "Bienvenidos a GRID." : "Bienvenido a NØDE.",
                    text: `Tu acceso anticipado quedó registrado. Te escribiremos por WhatsApp al ${formatPhone(f.whatsapp)} para activarlo${f.plan === "node" ? " con tu QR" : " y diseñar la implementación con tu equipo"}.`,
                  }))
                }>
                  <Honeypot />
                  <fieldset className="field">
                    <legend>Tipo de cuenta</legend>
                    <div className="seg seg--big">
                      <label>
                        <input type="radio" name="plan" value="node" checked={plan === "node"} onChange={() => setPlan("node")} />
                        <span><b>NØDE</b><small>Inteligencia personal para ti</small></span>
                      </label>
                      <label>
                        <input type="radio" name="plan" value="grid" checked={plan === "grid"} onChange={() => setPlan("grid")} />
                        <span><b>GRID</b><small>Inteligencia empresarial para tu equipo</small></span>
                      </label>
                    </div>
                  </fieldset>
                  <div className="grid-2">
                    <Field id="r-name" label="Nombre completo" name="nombre" autoComplete="name" required />
                    <Field id="r-email" label="Correo" name="correo" type="email" autoComplete="email" required />
                    <Field id="r-phone" label="WhatsApp" name="whatsapp" type="tel" autoComplete="tel" required placeholder="+52 55 0000 0000" />
                    <Field id="r-role" label="Rol / ocupación" name="rol" autoComplete="organization-title" optional />
                    {plan === "grid" && (
                      <>
                        <Field id="r-company" label="Empresa" name="empresa" autoComplete="organization" required />
                        <div className="field">
                          <label htmlFor="r-size">Tomadores de decisión</label>
                          <select id="r-size" name="tomadores" defaultValue="">
                            <option value="">Selecciona</option>
                            <option>1 – 5</option>
                            <option>6 – 15</option>
                            <option>16 – 50</option>
                            <option>50+</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <label className="check">
                    <input type="checkbox" name="privacidad" value="acepto" required />
                    <span>Acepto el aviso de privacidad y que BLANK me contacte sobre mi acceso.</span>
                  </label>
                  <p className="form__error" role="alert">{errors.registro}</p>
                  <button className="btn btn--light btn--block" type="submit" disabled={busy}>{busy ? "Enviando…" : "Crear mi acceso"}</button>
                  <p className="fine">Acceso anticipado. Te contactaremos para activar tu cuenta.</p>
                </form>
              </div>

              <div role="tabpanel" id="panel-escribir" aria-labelledby="tab-escribir" className="panel" hidden={tab !== "escribir"}>
                <div className="write">
                  <form className="form" noValidate onSubmit={(e) =>
                    send(e, "escribir", "mensaje", (f) => ({
                      title: "Mensaje recibido.",
                      text: `Gracias, ${f.nombre.split(" ")[0]}. Te respondemos a ${f.correo} en menos de 24 horas hábiles.`,
                    }))
                  }>
                    <Honeypot />
                    <fieldset className="field">
                      <legend>Asunto</legend>
                      <div className="chips">
                        {["Proyecto", "NØDE / GRID", "Alianza", "Prensa", "Talento"].map((a, i) => (
                          <label key={a}>
                            <input type="radio" name="asunto" value={a} defaultChecked={i === 0} />
                            <span>{a}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <div className="grid-2">
                      <Field id="m-name" label="Nombre" name="nombre" autoComplete="name" required />
                      <Field id="m-email" label="Correo" name="correo" type="email" autoComplete="email" required />
                    </div>
                    <div className="field">
                      <label htmlFor="m-msg">Mensaje</label>
                      <textarea id="m-msg" name="mensaje" rows={6} required />
                    </div>
                    <p className="form__error" role="alert">{errors.escribir}</p>
                    <button className="btn btn--light" type="submit" disabled={busy}>
                      {busy ? "Enviando…" : <>Enviar mensaje <span aria-hidden="true">↗</span></>}
                    </button>
                  </form>
                  <aside className="direct">
                    <p className="eyebrow">Directo</p>
                    <a className="direct__item" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                      <span className="mono">WhatsApp</span>
                      <span>{formatPhone(site.whatsapp)}</span>
                    </a>
                    <a className="direct__item" href={`mailto:${site.email}`}>
                      <span className="mono">Correo</span>
                      <span>{site.email}</span>
                    </a>
                    <a className="direct__item" href={`https://instagram.com/${site.instagram}`} target="_blank" rel="noopener noreferrer">
                      <span className="mono">Instagram</span>
                      <span>@{site.instagram}</span>
                    </a>
                    <p className="direct__note">Respondemos en menos de 24 horas hábiles.</p>
                  </aside>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  ...input
}: { id: string; label: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional && <small>(opcional)</small>}
      </label>
      <input id={id} {...input} />
    </div>
  );
}

function DemoForm({
  product,
  setProduct,
  error,
  busy,
  onSubmit,
}: {
  product: string;
  setProduct: (p: string) => void;
  error?: string;
  busy: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [now, setNow] = useState<ReturnType<typeof cdmxNow> | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Computed on the client only, so server and client markup never disagree about "today".
  useEffect(() => {
    const n = cdmxNow();
    setNow(n);
    setView({ y: n.y, m: n.m });
  }, []);

  const todayIso = now ? isoDate(now.y, now.m, now.d) : "";
  const maxIso = useMemo(() => {
    if (!now) return "";
    const d = new Date(Date.UTC(now.y, now.m, now.d + MAX_DAYS_AHEAD));
    return isoDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }, [now]);

  const slotPast = (iso: string, slot: string) => {
    if (!now || iso !== todayIso) return false;
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m <= now.h * 60 + now.min + 60; // at least 1h notice
  };

  const dayDisabled = (y: number, m: number, d: number) => {
    const iso = isoDate(y, m, d);
    const wd = new Date(Date.UTC(y, m, d)).getUTCDay();
    if (wd === 0 || wd === 6) return true;
    if (iso < todayIso || iso > maxIso) return true;
    if (iso === todayIso && SLOTS.every((s) => slotPast(iso, s))) return true;
    return false;
  };

  const cells = useMemo(() => {
    if (!view) return [];
    const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
    const offset = (first + 6) % 7; // Monday-first
    const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    return [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [view]);

  const canPrev = view && now ? view.y * 12 + view.m > now.y * 12 + now.m : false;
  const canNext = view && maxIso ? isoDate(view.y, view.m, 1).slice(0, 7) < maxIso.slice(0, 7) : false;
  const shift = (n: number) => setView((v) => (v ? { y: v.y + Math.floor((v.m + n) / 12), m: (v.m + n + 12) % 12 } : v));

  return (
    <form className="form" noValidate onSubmit={(e) => { onSubmit(e); }}>
      <Honeypot />
      <div className="demo">
        <div className="demo__pick">
          <fieldset className="field">
            <legend>¿Qué quieres conocer?</legend>
            <div className="seg">
              {PRODUCTS.map((p) => (
                <label key={p.v}>
                  <input type="radio" name="producto" value={p.v} checked={product === p.v} onChange={() => setProduct(p.v)} />
                  <span>{p.label ?? p.v}<small>{p.sub}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="cal">
            <div className="cal__head">
              <button type="button" className="icon-btn" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Mes anterior">←</button>
              <p aria-live="polite">{view ? `${MONTHS[view.m]} ${view.y}` : " "}</p>
              <button type="button" className="icon-btn" onClick={() => shift(1)} disabled={!canNext} aria-label="Mes siguiente">→</button>
            </div>
            <div className="cal__dow" aria-hidden="true">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="cal__grid" role="group" aria-label="Elige un día">
              {view && cells.map((d, i) => {
                if (d === null) return <span key={`e${i}`} />;
                const iso = isoDate(view.y, view.m, d);
                const off = dayDisabled(view.y, view.m, d);
                return (
                  <button
                    key={iso}
                    type="button"
                    className={`cal__day${iso === date ? " is-sel" : ""}${iso === todayIso ? " is-today" : ""}`}
                    disabled={off}
                    aria-pressed={iso === date}
                    aria-label={dayLabel(iso)}
                    onClick={() => {
                      setDate(iso);
                      if (time && slotPast(iso, time)) setTime("");
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="slots">
            <p className="slots__label">
              <span>{date ? dayLabel(date) : "Elige un día"}</span> <span className="mono">Hora CDMX</span>
            </p>
            <div className="slots__grid" role="radiogroup" aria-label="Elige un horario">
              {SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={time === s}
                  className={`slot${time === s ? " is-sel" : ""}`}
                  disabled={!date || slotPast(date, s)}
                  onClick={() => setTime(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="demo__info">
          <Field id="d-name" label="Nombre" name="nombre" autoComplete="name" required />
          <Field id="d-email" label="Correo" name="correo" type="email" autoComplete="email" required />
          <Field id="d-company" label="Empresa" name="empresa" autoComplete="organization" optional />
          <Field id="d-phone" label="WhatsApp" name="whatsapp" type="tel" autoComplete="tel" optional />
          <fieldset className="field">
            <legend>Formato</legend>
            <div className="seg seg--sm">
              <label><input type="radio" name="formato" value="Videollamada" defaultChecked /><span>Videollamada</span></label>
              <label><input type="radio" name="formato" value="Presencial" /><span>Presencial</span></label>
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="d-notes">¿Qué te gustaría resolver? <small>(opcional)</small></label>
            <textarea id="d-notes" name="notas" rows={3} />
          </div>
          <input type="hidden" name="fecha" value={date} />
          <input type="hidden" name="hora" value={time} />
          <div className={`summary${date && time ? " is-ready" : ""}`}>
            {date && time ? (
              <>
                <span className="mono">{product}</span> {dayLabel(date)} · {time} h
              </>
            ) : (
              "Selecciona día y horario."
            )}
          </div>
          <p className="form__error" role="alert">{error}</p>
          <button className="btn btn--light btn--block" type="submit" disabled={busy}>{busy ? "Enviando…" : "Confirmar demo"}</button>
        </div>
      </div>
    </form>
  );
}
