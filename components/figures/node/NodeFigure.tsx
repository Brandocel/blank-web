"use client";

import * as React from "react";
import { Dots, IsoFigure, Line, Plate, Solid } from "@/components/iso/react/draw";
import { follow, useInView, useLoop, useReadout, useStillness } from "@/components/iso/react/live";
import { LiveSolid, applySolid, clamp01, makeBead, placeBead, smooth } from "../shared";
import {
  BASE,
  CARTRIDGES,
  CHANNELS,
  COLUMN_MAX,
  COLUMN_MIN,
  CORE_ART,
  CORE_DEPTH,
  HEIGHT,
  LAMPS,
  LAMP_TRAY,
  PLATE,
  SOURCES,
  WIDTH,
  at,
  beadAt,
  columnPaths,
  depth,
} from "./geometry";

const LABEL =
  "NØDE como instrumento: una base circular con ocho cartuchos, uno por cada fuente de información de una persona (WhatsApp, correo, documentos, calendario, contactos, notas, audios y contratos). Desde cada cartucho corre un canal hacia un núcleo central. Las piezas de información viajan por los canales, entran al núcleo y una columna de contexto crece capa por capa. Cinco luces al frente marcan el ciclo: entender, proponer, confirmar, ejecutar y registrar.";

const TRAVEL = 1.9;
const columnFor = (count: number) => COLUMN_MIN + (COLUMN_MAX - COLUMN_MIN) * (1 - Math.exp(-count / 28));
const START = columnPaths(COLUMN_MIN);

type Flight = { source: number; age: number; bead: SVGGElement };

// Painter's order: cartridges and core sorted back to front, with a bead slot before each and one after.
const ITEMS = [
  ...CARTRIDGES.map((c, i) => ({ kind: "cart" as const, i, depth: c.depth })),
  { kind: "core" as const, i: -1, depth: CORE_DEPTH },
].sort((a, b) => a.depth - b.depth);
const ITEM_DEPTHS = ITEMS.map((it) => it.depth);

export default function NodeFigure() {
  const { anchor, say } = useReadout<HTMLDivElement>();
  const wrap = React.useRef<HTMLDivElement>(null);
  const inView = useInView(wrap);
  const still = useStillness();
  const slots = React.useRef<(SVGGElement | null)[]>([]);
  const columnRef = React.useRef<SVGGElement>(null);
  const pointRef = React.useRef<SVGGElement>(null);
  const layersRef = React.useRef<SVGPathElement>(null);
  const glowRef = React.useRef<SVGCircleElement>(null);
  const ledRefs = React.useRef<(SVGGElement | null)[]>([]);
  const lampRefs = React.useRef<(SVGGElement | null)[]>([]);

  const sim = React.useRef({
    flights: [] as Flight[],
    pool: [] as SVGGElement[],
    clock: 0,
    nextEmit: 0.2,
    turn: 0,
    count: 0,
    shown: COLUMN_MIN,
    selected: null as number | null,
    led: new Array<number>(SOURCES.length).fill(0),
    last: -1,
  });

  const drawColumn = React.useCallback((h: number) => {
    const p = columnPaths(h);
    applySolid(columnRef.current, p.body);
    applySolid(pointRef.current, p.point);
    layersRef.current?.setAttribute("d", p.layers || "M0 0");
    glowRef.current?.setAttribute("cx", p.glow[0].toFixed(1));
    glowRef.current?.setAttribute("cy", p.glow[1].toFixed(1));
  }, []);

  // Reduced motion: one still, truthful frame.
  React.useEffect(() => {
    if (!still) return;
    const s = sim.current;
    s.count = 24;
    s.shown = columnFor(24);
    drawColumn(s.shown);
    say("contexto · 24 piezas");
  }, [still, drawColumn, say]);

  const emit = (source: number) => {
    const s = sim.current;
    const bead = s.pool.pop() ?? makeBead();
    s.flights.push({ source, age: 0, bead });
    s.led[source] = 1;
  };

  useLoop((dt, calm) => {
    const s = sim.current;
    if (calm) return false;
    s.clock += dt;

    // emit: a selected source sends often; otherwise sources take turns, a little irregularly
    if (s.clock >= s.nextEmit) {
      const source = s.selected ?? (s.turn * 3) % SOURCES.length;
      s.turn++;
      emit(source);
      s.nextEmit = s.clock + (s.selected !== null ? 0.45 : 0.55 + ((s.turn * 7) % 5) * 0.12);
    }

    // fly
    for (const f of s.flights) {
      f.age += dt;
      const t = smooth(clamp01(f.age / TRAVEL));
      const p = beadAt(f.source, t);
      const alpha = Math.min(clamp01(f.age / 0.25), clamp01((1 - t) / 0.12 + 0.0));
      placeBead(f.bead, at(p), depth(p), ITEM_DEPTHS, slots.current, alpha);
    }
    const landed = s.flights.filter((f) => f.age >= TRAVEL);
    for (const f of landed) {
      f.bead.style.opacity = "0";
      s.pool.push(f.bead);
      s.count++;
      s.last = f.source;
    }
    if (landed.length) s.flights = s.flights.filter((f) => f.age < TRAVEL);

    // column grows toward the context it holds
    const target = columnFor(s.count);
    const next = follow(s.shown, target, dt, 0.35);
    if (Math.abs(next - s.shown) > 0.004) drawColumn(next);
    s.shown = next;

    // LEDs and the five-step cycle
    s.led = s.led.map((v, i) => {
      const nv = Math.max(0, v - dt * 2.2);
      ledRefs.current[i]?.setAttribute("data-tone", nv > 0.15 ? "hi" : "lo");
      return nv;
    });
    const stage = Math.floor(s.clock / 0.8) % 5;
    lampRefs.current.forEach((g, i) => g?.setAttribute("data-tone", i === stage ? "hi" : "lo"));
    if (glowRef.current) glowRef.current.style.opacity = (0.55 + 0.25 * Math.sin(s.clock * 2.4)).toFixed(3);

    const who = s.selected ?? s.last;
    say(`${who >= 0 ? SOURCES[who] + " → " : ""}contexto · ${s.count} piezas`);
    return true;
  }, inView && !still);

  const onOver = (e: React.PointerEvent) => {
    const el = (e.target as Element).closest("[data-source]");
    sim.current.selected = el ? Number(el.getAttribute("data-source")) : null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const s = sim.current;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const d = e.key === "ArrowRight" ? 1 : SOURCES.length - 1;
      s.selected = ((s.selected ?? -1) + d + SOURCES.length) % SOURCES.length;
      say(`${SOURCES[s.selected]} seleccionada`);
    } else if (e.key === "Escape") s.selected = null;
  };

  const Slot = (k: number) => <g key={`slot-${k}`} ref={(el) => { slots.current[k] = el; }} />;

  return (
    <div className="iso fig" ref={anchor}>
      <Plate fig="Fig. 01" title="NØDE — The point" hint="Pasa sobre una fuente" readout="contexto · 0 piezas">
        <div
          ref={wrap}
          className="fig__stage"
          tabIndex={0}
          role="group"
          aria-label="Figura interactiva de NØDE. Flechas para elegir una fuente."
          onPointerOver={onOver}
          onPointerLeave={() => (sim.current.selected = null)}
          onKeyDown={onKey}
        >
          <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
            {/* base */}
            <path className="iso-halo" d={BASE.halo} />
            {BASE.feet.map((parts, i) => (
              <g key={i}>
                <Solid paths={parts[0]!} tone="lo" crease="faint" />
                <Solid paths={parts[1]!} tone="lo" crease="faint" />
              </g>
            ))}
            <Solid paths={BASE.slab} tone="mid" crease="faint" inner={<Line d={BASE.band} tone="faint" />} />
            <Line d={BASE.groove} tone="lo" />
            <Line d={BASE.inner} tone="faint" />
            <Line d={BASE.rimMinor} tone="faint" />
            <Line d={BASE.rimMajor} tone="lo" />
            <Line d={BASE.screwRings} tone="lo" />
            <Dots points={BASE.screws} size={0.55} tone="mid" />
            <Line d={BASE.floor} tone="faint" />
            {CHANNELS.map((d, i) => <Line key={i} d={d} tone="lo" />)}
            <Solid paths={LAMP_TRAY} tone="lo" crease="none" />
            {LAMPS.map((l, i) => (
              <g key={i}>
                <Solid paths={l.solid} tone="mid" crease="faint" />
                <g ref={(el) => { lampRefs.current[i] = el; }} className="iso-dots fig-lamp" data-tone="lo">
                  <circle cx={l.dot[0].toFixed(1)} cy={l.dot[1].toFixed(1)} r={1.1} />
                </g>
              </g>
            ))}
            <Solid paths={PLATE.body} tone="lo" crease="none" />
            <Line d={PLATE.line} tone="faint" />
            <Line d={PLATE.rule} tone="lo" free />
            <Dots points={PLATE.screws} size={0.45} tone="mid" />

            {/* painter's order with bead slots */}
            {ITEMS.flatMap((it, k) => {
              const node =
                it.kind === "core" ? (
                  <g key="core">
                    <path className="iso-halo" d={CORE_ART.halo} />
                    <Solid paths={CORE_ART.pedestal} tone="lo" crease="faint" />
                    <Dots points={CORE_ART.pedScrews} size={0.5} tone="mid" />
                    <Solid paths={CORE_ART.housing} tone="mid" crease="faint" inner={<Line d={CORE_ART.seams} tone="faint" />} />
                    <Line d={CORE_ART.knurl} tone="faint" />
                    <Line d={CORE_ART.window} tone="lo" />
                    <Solid paths={CORE_ART.cap} tone="mid" crease="faint" />
                    <Line d={CORE_ART.capMinor} tone="lo" />
                    <Line d={CORE_ART.capMajor} tone="mid" />
                    <Line d={CORE_ART.capRing} tone="faint" />
                    <Solid paths={CORE_ART.collar} tone="mid" crease="faint" />
                    <LiveSolid ref={columnRef} paths={START.body} tone="hi" />
                    <path ref={layersRef} className="iso-line" data-tone="faint" d={START.layers || "M0 0"} />
                    <circle ref={glowRef} className="fig-glow" cx={START.glow[0].toFixed(1)} cy={START.glow[1].toFixed(1)} r={14} />
                    <LiveSolid ref={pointRef} paths={START.point} tone="hi" lit />
                  </g>
                ) : (
                  (() => {
                    const c = CARTRIDGES[it.i]!;
                    return (
                      <g key={`cart-${it.i}`} data-source={it.i} className="fig-part">
                        <Solid paths={c.socket} tone="lo" crease="faint" />
                        <Dots points={c.socketScrews} size={0.45} tone="mid" />
                        <Solid paths={c.body} tone="mid" crease="faint" />
                        <Line d={c.slot} tone="faint" />
                        <Line d={c.rule} tone="lo" free />
                        <g ref={(el) => { ledRefs.current[it.i] = el; }} className="iso-dots fig-led" data-tone="lo">
                          <circle cx={c.led[0].toFixed(1)} cy={c.led[1].toFixed(1)} r={1} />
                        </g>
                        <Solid paths={c.knob} tone="mid" crease="faint" />
                        <Line d={c.knurl} tone="faint" />
                      </g>
                    );
                  })()
                );
              return [Slot(k), node];
            })}
            {Slot(ITEMS.length)}
          </IsoFigure>
        </div>
      </Plate>
    </div>
  );
}
