"use client";

import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/Wordmark";
import { ACTION_TYPES, DEMO_TODAY, demoDocs, demoSuggestions, type DemoAction, type DemoDoc } from "@/lib/demo-docs";

type Msg = {
  id: number;
  role: "user" | "assistant";
  raw: string; // lo que viaja a la API (incluye el bloque <acciones>)
  text: string; // lo que se muestra
  actions?: DemoAction[];
  state?: "pending" | "done" | "dismissed";
  local?: boolean; // generado por la interfaz, no por el modelo
};
type Item = DemoAction & { id: number };
type Pane = "docs" | "chat" | "space";

const LABEL: Record<DemoAction["tipo"], string> = { archivar: "Archivar", recordatorio: "Recordatorio", borrador: "Borrador", tarea: "Tarea" };
const GROUP: Record<DemoAction["tipo"], string> = { archivar: "Archivados", recordatorio: "Recordatorios", borrador: "Borradores", tarea: "Tareas" };
const DONE: Record<DemoAction["tipo"], string> = { archivar: "Archivado", recordatorio: "Recordatorio creado", borrador: "Borrador guardado", tarea: "Tarea anotada" };

/** Separa el texto visible del bloque <acciones>[…]</acciones> que NØDE agrega al final. */
function split(raw: string): { text: string; actions?: DemoAction[] } {
  const start = raw.indexOf("<acciones");
  if (start < 0) return { text: raw.trim() };
  const text = raw.slice(0, start).trim();
  const match = raw.slice(start).match(/<acciones>([\s\S]*?)<\/acciones>/);
  if (!match) return { text };
  try {
    const list: unknown = JSON.parse(match[1]);
    if (!Array.isArray(list)) return { text };
    const actions = list
      .filter((a): a is DemoAction => !!a && typeof a === "object" && ACTION_TYPES.includes((a as DemoAction).tipo) && typeof (a as DemoAction).titulo === "string")
      .slice(0, 5);
    return actions.length ? { text, actions } : { text };
  } catch {
    return { text };
  }
}

let seq = 0;
const nextId = () => ++seq;

export default function NodeDemo() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [ready, setReady] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [doc, setDoc] = useState<DemoDoc | null>(null);
  const [draft, setDraft] = useState<Item | null>(null);
  const [pane, setPane] = useState<Pane>("chat");
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/demo")
      .then((r) => r.json())
      .then((d: { ready: boolean; remaining: number }) => {
        setReady(d.ready);
        setRemaining(d.remaining);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [msgs]);

  useEffect(() => {
    if (!doc && !draft) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDoc(null);
      setDraft(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doc, draft]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setError("");
    setInput("");
    setPane("chat");

    const user: Msg = { id: nextId(), role: "user", raw: content, text: content };
    const reply: Msg = { id: nextId(), role: "assistant", raw: "", text: "" };
    const history = [...msgs, user];
    setMsgs([...history, reply]);
    setBusy(true);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.raw })) }),
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        if (res.status === 429) setRemaining(0);
        if (res.status === 503) setReady(false);
        throw new Error(data?.error ?? "No pudimos conectar con NØDE. Intenta de nuevo.");
      }
      const left = res.headers.get("X-Demo-Remaining");
      if (left !== null) setRemaining(Number(left));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let raw = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const { text } = split(raw);
        setMsgs((list) => list.map((m) => (m.id === reply.id ? { ...m, raw, text } : m)));
      }
      const { text, actions } = split(raw);
      if (!text && !actions) throw new Error("NØDE no respondió. Intenta de nuevo.");
      setMsgs((list) => list.map((m) => (m.id === reply.id ? { ...m, raw, text, actions, state: actions ? "pending" : undefined } : m)));
    } catch (e) {
      // Se retira la pregunta sin respuesta para que el historial siga alternando usuario / NØDE.
      setMsgs((list) => list.filter((m) => m.id !== reply.id && m.id !== user.id));
      setInput(content);
      setError(e instanceof Error ? e.message : "Algo salió mal. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function confirm(msg: Msg) {
    if (!msg.actions) return;
    const added = msg.actions.map((a) => ({ ...a, id: nextId() }));
    setItems((list) => [...added, ...list]);
    setLog((list) => [...added.map((a) => `${DONE[a.tipo]} · ${a.titulo}`).reverse(), ...list]);
    const summary = `Hecho.\n${added.map((a) => `✓ ${DONE[a.tipo]}: ${a.titulo}${a.fecha ? ` (${a.fecha})` : ""}`).join("\n")}`;
    setMsgs((list) => [
      ...list.map((m) => (m.id === msg.id ? { ...m, state: "done" as const } : m)),
      { id: nextId(), role: "assistant", raw: summary, text: summary, local: true },
    ]);
  }

  function dismiss(msg: Msg) {
    setMsgs((list) => list.map((m) => (m.id === msg.id ? { ...m, state: "dismissed" as const } : m)));
  }

  function edit(msg: Msg) {
    dismiss(msg);
    setInput("Cambia la propuesta: ");
    inputRef.current?.focus();
  }

  const out = remaining === 0;
  const blocked = busy || out || !ready;
  const of = (tipo: DemoAction["tipo"]) => items.filter((i) => i.tipo === tipo);

  return (
    <div className="demo">
      <header className="demo__bar">
        <a href="/" className="demo__brand" aria-label="Volver a BLANK">
          <Wordmark name="NØDE" registered={false} />
          <span className="demo__tag">Demo en vivo</span>
        </a>
        <p className="demo__meta">
          {remaining === null ? "Datos de ejemplo" : out ? "Sin mensajes por hoy" : `${remaining} mensajes restantes`}
        </p>
        <div className="demo__barcta">
          <a href="/#demo" className="btn btn--ghost btn--sm demo__hide-sm">Agendar conversación</a>
          <a href="/#registro" className="btn btn--light btn--sm">Activar NØDE</a>
        </div>
      </header>

      <nav className="demo__tabs" aria-label="Secciones del demo">
        {([["docs", "Documentos"], ["chat", "NØDE"], ["space", `Espacio${items.length ? ` · ${items.length}` : ""}`]] as [Pane, string][]).map(([key, label]) => (
          <button key={key} className={pane === key ? "is-active" : ""} aria-pressed={pane === key} onClick={() => setPane(key)}>{label}</button>
        ))}
      </nav>

      <div className="demo__grid" data-pane={pane}>
        <aside className="demo__col demo__docs" aria-label="Documentos de ejemplo">
          <p className="mono">Contexto · {demoDocs.length} documentos</p>
          <p className="demo__hint">Espacio ficticio de Mariana Robles, directora de un estudio de arquitectura. Ábrelos o pregúntale a NØDE.</p>
          <ul>
            {demoDocs.map((d) => (
              <li key={d.id}>
                <button className="demo__doc" onClick={() => setDoc(d)}>
                  <span className="demo__dockind">{d.kind}</span>
                  <strong>{d.name}</strong>
                  <small>{d.origin} · {d.date}</small>
                </button>
              </li>
            ))}
          </ul>
          <p className="demo__today">En el demo, hoy es {DEMO_TODAY}.</p>
        </aside>

        <main className="demo__col demo__chat" id="main">
          <div className="demo__msgs" ref={chatRef} aria-live="polite">
            {msgs.length === 0 && (
              <div className="demo__empty">
                <h1>Pruébalo como si ya fuera <em>tuyo.</em></h1>
                <p>NØDE ya leyó los seis documentos de este espacio. Pregúntale algo, pídele una decisión o un borrador, y confirma las acciones que proponga.</p>
                <div className="demo__sugs">
                  {demoSuggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} disabled={blocked}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={`demo__msg demo__msg--${m.role}${m.local ? " is-local" : ""}`}>
                {m.role === "assistant" && !m.text && !m.actions ? (
                  <span className="demo__typing" aria-label="NØDE está escribiendo"><i /><i /><i /></span>
                ) : (
                  m.text
                )}
                {m.actions && (
                  <div className={`demo__card is-${m.state}`}>
                    <p className="mono">{m.state === "done" ? "Ejecutado" : m.state === "dismissed" ? "Descartado" : "Propuesta · espera tu sí"}</p>
                    <ul>
                      {m.actions.map((a, i) => (
                        <li key={i}>
                          <span className="demo__pill">{LABEL[a.tipo]}</span>
                          <span>
                            <strong>{a.titulo}</strong>
                            {(a.fecha || a.detalle) && <small>{[a.fecha, a.detalle].filter(Boolean).join(" · ")}</small>}
                            {a.contenido && <small className="demo__preview">{a.contenido}</small>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {m.state === "pending" && (
                      <div className="demo__cardcta">
                        <button className="btn btn--light btn--sm" onClick={() => confirm(m)}>Confirmar</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => edit(m)}>Editar</button>
                        <button className="demo__link" onClick={() => dismiss(m)}>Descartar</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            className="demo__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            {error && <p className="demo__error" role="alert">{error}</p>}
            {(out || !ready) && (
              <p className="demo__limit">
                {out ? "Usaste todos los mensajes del demo por hoy." : "El demo en vivo aún no está activo."}{" "}
                <a href="/#registro">Activa tu NØDE</a> o <a href="/#demo">agenda una conversación</a>.
              </p>
            )}
            <div className="demo__inputrow">
              <label className="sr-only" htmlFor="demo-input">Escríbele a NØDE</label>
              <textarea
                id="demo-input"
                ref={inputRef}
                rows={1}
                maxLength={2000}
                value={input}
                placeholder={out ? "Límite del demo alcanzado" : "Escríbele a NØDE…"}
                disabled={out || !ready}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button type="submit" className="btn btn--light" disabled={blocked || !input.trim()}>{busy ? "…" : "Enviar"}</button>
            </div>
            <p className="demo__fine">Demo con datos ficticios e IA real. No compartas información personal o confidencial.</p>
          </form>
        </main>

        <aside className="demo__col demo__space" aria-label="Tu espacio">
          <p className="mono">Tu espacio</p>
          {items.length === 0 && <p className="demo__hint">Aquí aparece lo que NØDE ejecuta cuando confirmas: recordatorios, borradores, tareas y archivos.</p>}
          {(["recordatorio", "tarea", "borrador", "archivar"] as const).map((tipo) =>
            of(tipo).length ? (
              <section key={tipo}>
                <h2>{GROUP[tipo]}</h2>
                <ul>
                  {of(tipo).map((i) => (
                    <li key={i.id}>
                      {i.contenido ? (
                        <button className="demo__item" onClick={() => setDraft(i)}>
                          <strong>{i.titulo}</strong>
                          <small>Abrir borrador →</small>
                        </button>
                      ) : (
                        <div className="demo__item">
                          <strong>{i.titulo}</strong>
                          {(i.fecha || i.detalle) && <small>{[i.fecha, i.detalle].filter(Boolean).join(" · ")}</small>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
          {log.length > 0 && (
            <section>
              <h2>Historial</h2>
              <ul className="demo__log">
                {log.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </section>
          )}
          <div className="demo__upsell">
            <p>En tu NØDE real, esto se conecta a tu correo, archivos y calendario.</p>
            <a href="/#registro" className="link-arrow">Activar NØDE <span aria-hidden="true">→</span></a>
          </div>
        </aside>
      </div>

      {(doc || draft) && (
        <div className="demo__modal" role="dialog" aria-modal="true" aria-label={doc?.name ?? draft?.titulo} onClick={() => { setDoc(null); setDraft(null); }}>
          <div className="demo__sheet" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <p className="mono">{doc ? `${doc.kind} · ${doc.origin} · ${doc.date}` : "Borrador · sin enviar"}</p>
                <h2>{doc?.name ?? draft?.titulo}</h2>
              </div>
              <button className="demo__close" aria-label="Cerrar" autoFocus onClick={() => { setDoc(null); setDraft(null); }}>×</button>
            </header>
            <pre>{doc?.body ?? draft?.contenido}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
