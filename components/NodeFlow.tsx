"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "me" | "node" | "log"; text: string; actions?: boolean };

const steps: { name: string; title: string; text: string; msgs: Msg[] }[] = [
  {
    name: "Entender",
    title: "Entiende.",
    text: "Escucha tu voz y la cruza con todo lo que ya sabe de ti.",
    msgs: [
      { from: "me", text: "Archiva el contrato de Altamar que me mandaron por correo y recuérdame la renovación." },
      { from: "node", text: "Encontré «Contrato_Altamar_v3.pdf» en tu correo del 2 de octubre. Vigencia hasta el 30 de noviembre." },
    ],
  },
  {
    name: "Proponer",
    title: "Propone.",
    text: "Un plan claro: qué, dónde y cuándo.",
    msgs: [{ from: "node", text: "Propongo:\n1. Archivarlo en Proyectos › Altamar.\n2. Recordatorio el 15 de nov, 9:00.\n3. Borrador de correo de renovación." }],
  },
  {
    name: "Confirmar",
    title: "Espera tu sí.",
    text: "Tú tienes la última palabra. Siempre.",
    msgs: [
      { from: "node", text: "¿Confirmas?", actions: true },
      { from: "me", text: "Confirmo. Que el recordatorio sea el 10." },
    ],
  },
  {
    name: "Ejecutar",
    title: "Ejecuta.",
    text: "Archiva, agenda y redacta por ti.",
    msgs: [{ from: "node", text: "Hecho.\n✓ Archivado en Altamar\n✓ Recordatorio 10 nov, 9:00\n✓ Borrador listo para revisar" }],
  },
  {
    name: "Registrar",
    title: "Recuerda.",
    text: "Cada acción se vuelve memoria. Cada año, más contexto.",
    msgs: [{ from: "log", text: "Registrado en tu historial · Altamar · Contratos" }],
  },
];

export default function NodeFlow() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setAuto(false);
  }, []);

  useEffect(() => {
    if (!auto || !visible) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % steps.length), step === steps.length - 1 ? 6000 : 4200);
    return () => window.clearTimeout(t);
  }, [auto, visible, step]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [step]);

  const msgs = steps.slice(0, step + 1).flatMap((s, si) => s.msgs.map((m, mi) => ({ ...m, key: `${si}-${mi}`, fresh: si === step })));
  const current = steps[step];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    setAuto(false);
    const next = (step + (e.key === "ArrowRight" ? 1 : steps.length - 1)) % steps.length;
    setStep(next);
    (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div className="wrap flow" ref={ref}>
      <div className="flow__steps" role="tablist" aria-label="Lógica de interacción de NØDE" onKeyDown={onKey}>
        {steps.map((s, i) => (
          <button
            key={s.name}
            role="tab"
            aria-selected={i === step}
            tabIndex={i === step ? 0 : -1}
            className={`flow__step${i === step ? " is-active" : ""}${i < step ? " is-done" : ""}`}
            onClick={() => {
              setAuto(false);
              setStep(i);
            }}
          >
            <span className="mono">0{i + 1}</span>
            {s.name}
            {i === step && auto && visible && <span className="flow__bar" key={step} />}
          </button>
        ))}
      </div>
      <div className="flow__stage">
        <div className="phone">
          <div className="phone__top">
            <span className="dot" />
            <div>
              <strong>NØDE</strong>
              <small>en línea</small>
            </div>
          </div>
          <div className="phone__chat" ref={chatRef} aria-live="polite">
            {msgs.map((m) =>
              m.from === "log" ? (
                <p key={m.key} className={`log${m.fresh ? " fresh" : ""}`}>{m.text}</p>
              ) : (
                <div key={m.key} className={`bubble bubble--${m.from}${m.fresh ? " fresh" : ""}`}>
                  {m.text}
                  {m.actions && (
                    <span className="bubble__actions">
                      <span className={step > 2 || (step === 2 && m.fresh) ? "is-on" : ""}>Confirmar</span>
                      <span>Editar</span>
                    </span>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
        <div className="flow__explain" key={step}>
          <p className="mono">0{step + 1} — {current.name}</p>
          <h3 className="flow__title">{current.title}</h3>
          <p>{current.text}</p>
          <p className="note">Nada sensible ocurre sin tu aprobación.</p>
        </div>
      </div>
    </div>
  );
}
