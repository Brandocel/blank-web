"use client";

import * as React from "react";
import { Dots, IsoFigure, Line, Plate, Solid } from "@/components/iso/react/draw";
import { useInView, useLoop, useReadout, useStillness } from "@/components/iso/react/live";
import { makeBead, placeBead } from "../shared";
import { AGENTS, AGENT_ART, BASE, HEIGHT, HUB, HUB_LEDS, RAILS, SOCKET_ART, WIDTH, at, depth, pointOn, routeOf } from "./geometry";

const LABEL =
  "GRID como instrumento: una placa con una cuadrícula de rieles. En el centro, un núcleo de contexto compartido; alrededor, cinco agentes, uno por cada tomador de decisión (Dirección, Finanzas, Comercial, Operaciones y Marca), y tres bases libres para nuevas integraciones. La información viaja por los rieles de un agente a otro pasando siempre por el núcleo, que enciende una luz por cada pieza compartida.";

const SPEED = 62; // world units per second

type Item =
  | { kind: "rail"; i: number; depth: number }
  | { kind: "hub"; depth: number }
  | { kind: "agent"; i: number; depth: number }
  | { kind: "socket"; i: number; depth: number };

const ITEMS: Item[] = [
  ...RAILS.map((r, i) => ({ kind: "rail" as const, i, depth: r.depth })),
  { kind: "hub" as const, depth: HUB.depth },
  ...AGENT_ART.map((a, i) => ({ kind: "agent" as const, i, depth: a.depth })),
  ...SOCKET_ART.map((s, i) => ({ kind: "socket" as const, i, depth: s.depth })),
].sort((a, b) => a.depth - b.depth);
const SOLID_DEPTHS = ITEMS.filter((it) => it.kind !== "rail").map((it) => it.depth);

type Flight = { from: number; to: number; d: number; route: ReturnType<typeof routeOf>; bead: SVGGElement; shared: boolean };

export default function GridFigure() {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const wrap = React.useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const still = useStillness();
  const slots = React.useRef<(SVGGElement | null)[]>([]);
  const flashRefs = React.useRef<(SVGCircleElement | null)[]>([]);
  const ledRefs = React.useRef<(SVGCircleElement | null)[]>([]);
  const sim = React.useRef({
    flights: [] as Flight[],
    pool: [] as SVGGElement[],
    clock: 0,
    next: 0.3,
    turn: 0,
    shared: 0,
    flash: new Array<number>(AGENTS.length).fill(0),
    selected: null as number | null,
    lastText: "",
  });

  const paintLeds = React.useCallback((count: number) => {
    const lit = count % (HUB_LEDS.length + 1);
    ledRefs.current.forEach((c, i) => c?.setAttribute("data-on", i < lit ? "1" : "0"));
  }, []);

  React.useEffect(() => {
    if (!still) return;
    paintLeds(9);
    say("contexto compartido · 9");
  }, [still, paintLeds, say]);

  useLoop((dt, calm) => {
    const s = sim.current;
    if (calm) return false;
    s.clock += dt;

    if (s.clock >= s.next && s.flights.length < 6) {
      const from = s.selected ?? s.turn % AGENTS.length;
      const to = (from + 1 + ((s.turn * 3) % (AGENTS.length - 1))) % AGENTS.length;
      s.turn++;
      const route = routeOf(from, to);
      s.flights.push({ from, to, d: 0, route, bead: s.pool.pop() ?? makeBead(), shared: false });
      s.next = s.clock + (s.selected !== null ? 0.5 : 0.85);
      s.lastText = `${AGENTS[from].name} → ${AGENTS[to].name}`;
    }

    for (const f of s.flights) {
      f.d += SPEED * dt;
      const { p, hidden } = pointOn(f.route, f.d);
      const fadeIn = Math.min(1, f.d / 8);
      placeBead(f.bead, at(p), depth(p), SOLID_DEPTHS, slots.current, Math.min(fadeIn, 1 - hidden));
      if (!f.shared && f.d >= f.route.hubAt) {
        f.shared = true;
        s.shared++;
        paintLeds(s.shared);
      }
    }
    const done = s.flights.filter((f) => f.d >= f.route.total);
    for (const f of done) {
      f.bead.style.opacity = "0";
      s.pool.push(f.bead);
      s.flash[f.to] = 1;
    }
    if (done.length) s.flights = s.flights.filter((f) => f.d < f.route.total);

    s.flash = s.flash.map((v, i) => {
      const nv = Math.max(0, v - dt * 1.6);
      const el = flashRefs.current[i];
      if (el) el.style.opacity = (nv * 0.9).toFixed(3);
      return nv;
    });

    say(`${s.lastText} · contexto ${s.shared}`);
    return true;
  }, inView && !still);

  const onOver = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest("[data-agent]");
    sim.current.selected = el ? Number(el.getAttribute("data-agent")) : null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const s = sim.current;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : AGENTS.length - 1;
      s.selected = ((s.selected ?? -1) + d + AGENTS.length) % AGENTS.length;
      say(`${AGENTS[s.selected]!.name} seleccionado`);
    } else if (e.key === "Escape") s.selected = null;
  };

  let slot = 0;
  const Slot = () => {
    const k = slot++;
    return <g key={`slot-${k}`} ref={(el) => { slots.current[k] = el; }} />;
  };

  const render = (it: Item) => {
    if (it.kind === "rail") {
      const r = RAILS[it.i]!;
      return (
        <g key={`rail-${it.i}`}>
          <Solid paths={r.solid} tone="mid" crease="faint" />
          <Line d={r.groove} tone="faint" />
          <Dots points={r.studs} size={0.4} tone="mid" />
        </g>
      );
    }
    if (it.kind === "hub")
      return (
        <g key="hub">
          <path className="iso-halo" d={HUB.halo} />
          <Solid paths={HUB.pedestal} tone="lo" crease="faint" />
          <Dots points={HUB.screws} size={0.5} tone="mid" />
          <Solid paths={HUB.housing} tone="mid" crease="faint" inner={<Line d={HUB.seam} tone="faint" />} />
          <Solid paths={HUB.cap} tone="mid" crease="faint" />
          <Line d={HUB.ticksMinor} tone="lo" />
          <Line d={HUB.ticksMajor} tone="mid" />
          <Line d={HUB.ring} tone="faint" />
          <Dots points={HUB.grid} size={0.9} tone="mid" />
          <g className="fig-leds">
            {HUB_LEDS.map(([x, y], i) => (
              <circle key={i} ref={(el) => { ledRefs.current[i] = el; }} cx={x.toFixed(1)} cy={y.toFixed(1)} r={0.75} data-on="0" />
            ))}
          </g>
          <Solid paths={HUB.center} tone="hi" crease="none" lit />
        </g>
      );
    if (it.kind === "agent") {
      const a = AGENT_ART[it.i]!;
      return (
        <g key={`agent-${it.i}`} data-agent={it.i} className="fig-part">
          <path className="iso-halo" d={a.halo} />
          <Solid paths={a.pedestal} tone="lo" crease="faint" />
          <Dots points={a.screws} size={0.45} tone="mid" />
          <Solid paths={a.body} tone="mid" crease="faint" inner={<Line d={a.seams} tone="faint" />} />
          <Line d={a.knurl} tone="faint" />
          <Solid paths={a.cap} tone="mid" crease="faint" />
          <Line d={a.ticksMinor} tone="faint" />
          <Line d={a.ticksMajor} tone="lo" />
          <Solid paths={a.eye} tone="hi" crease="none" />
          <circle ref={(el) => { flashRefs.current[it.i] = el; }} className="fig-flash" cx={a.flash[0].toFixed(1)} cy={a.flash[1].toFixed(1)} r={9} style={{ opacity: 0 }} />
        </g>
      );
    }
    const sk = SOCKET_ART[it.i]!;
    return (
      <g key={`socket-${it.i}`}>
        <Solid paths={sk.pedestal} tone="lo" crease="faint" />
        <Line d={sk.ring} tone="lo" />
        <Line d={sk.bore} tone="faint" />
        <Dots points={sk.screws} size={0.45} tone="mid" />
      </g>
    );
  };

  return (
    <div className="iso fig" ref={anchor}>
      <Plate fig="Fig. 02" title="GRID — The system" hint="Pasa sobre un agente" readout="contexto · 0">
        <div
          ref={wrap}
          className="fig__stage"
          tabIndex={0}
          role="group"
          aria-label="Figura interactiva de GRID. Flechas para elegir un agente."
          onPointerOver={onOver}
          onPointerLeave={() => (sim.current.selected = null)}
          onKeyDown={onKey}
        >
          <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
            <path className="iso-halo" d={BASE.halo} />
            {BASE.feet.map((parts, i) => (
              <g key={i}>
                <Solid paths={parts[0]!} tone="lo" crease="faint" />
                <Solid paths={parts[1]!} tone="lo" crease="faint" />
              </g>
            ))}
            <Solid paths={BASE.slab} tone="mid" crease="faint" />
            <Line d={BASE.groove} tone="lo" />
            <Line d={BASE.inner} tone="faint" />
            <Line d={BASE.screwRings} tone="lo" />
            <Dots points={BASE.screws} size={0.55} tone="mid" />
            {BASE.strips.map((p, i) => <Solid key={i} paths={p} tone="lo" crease="none" />)}
            <Line d={BASE.ticksMinor} tone="lo" />
            <Line d={BASE.ticksMajor} tone="mid" />
            <Solid paths={BASE.label} tone="lo" crease="none" />
            <Line d={BASE.labelLine} tone="faint" />
            <Line d={BASE.labelRule} tone="lo" free />
            <Dots points={BASE.labelScrews} size={0.45} tone="mid" />
            {ITEMS.flatMap((it) => (it.kind === "rail" ? [render(it)] : [Slot(), render(it)]))}
            {Slot()}
          </IsoFigure>
        </div>
      </Plate>
    </div>
  );
}
