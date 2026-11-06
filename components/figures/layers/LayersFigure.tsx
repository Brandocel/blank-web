import { cylinder, fitProjection, insetPlan, iso, onTop, planOutline, slabOf, type Plan, type Point3 } from "@/components/iso/iso-kit";
import { Dots, Line, Solid } from "@/components/iso/react/draw";
import { circleOnTop } from "../shared";

/** "Cómo se conecta": four plates of one instrument, stacked. Bottom to top: operación, sistemas, inteligencia, estrategia. */
const W = 460;
const H = 400;
const PLAN: Plan = { x: -62, y: -62, w: 124, d: 124, r: 8 };
const T = 3; // plate thickness
const GAP = 22; // rest spacing between plates
export const LAYERS = ["Operación", "Sistemas", "Inteligencia", "Estrategia"] as const;
const EXPLODE = 12; // extra spacing per plate when the figure opens on scroll

const P = fitProjection(
  [
    [PLAN.x, PLAN.y, 0],
    [PLAN.x + PLAN.w, PLAN.y, 0],
    [PLAN.x, PLAN.y + PLAN.d, 0],
    [PLAN.x + PLAN.w, PLAN.y + PLAN.d, 0],
    [PLAN.x, PLAN.y, 3 * (GAP + EXPLODE) + T + 4],
    [PLAN.x + PLAN.w, PLAN.y + PLAN.d, 3 * (GAP + EXPLODE) + T + 4],
  ],
  W,
  H,
  { pad: 18 },
);
const at = (p: Point3) => iso(p, P);
const o = at([0, 0, 0]);
const ez = at([0, 0, 1]);
const EZ = [+(ez[0] - o[0]).toFixed(4), +(ez[1] - o[1]).toFixed(4)];

const PINS = [
  [PLAN.x + 10, PLAN.y + 10],
  [PLAN.x + PLAN.w - 10, PLAN.y + 10],
  [PLAN.x + 10, PLAN.y + PLAN.d - 10],
  [PLAN.x + PLAN.w - 10, PLAN.y + PLAN.d - 10],
];

function plate(i: number) {
  const z = i * GAP;
  const top = z + T;
  const inner = insetPlan(PLAN, 16);
  const ticks = { minor: [] as string[], major: [] as string[] };
  for (let x = PLAN.x + 14, k = 0; x <= PLAN.x + PLAN.w - 14; x += 4, k++) {
    (k % 5 === 0 ? ticks.major : ticks.minor).push(onTop([[x, PLAN.y + PLAN.d - 5], [x, PLAN.y + PLAN.d - (k % 5 === 0 ? 10 : 8)]], top, P));
  }
  let pattern = "";
  let dots: [number, number][] = [];
  if (i === 0) {
    // operación: rails
    pattern = [-24, -12, 0, 12, 24].map((y) => onTop([[inner.x, y], [inner.x + inner.w, y]], top, P)).join("");
  } else if (i === 1) {
    // sistemas: a grid of channels
    const lines: string[] = [];
    for (let v = inner.x; v <= inner.x + inner.w + 0.1; v += inner.w / 5) {
      lines.push(onTop([[v, inner.y], [v, inner.y + inner.d]], top, P), onTop([[inner.x, v], [inner.x + inner.w, v]], top, P));
    }
    pattern = lines.join("");
  } else if (i === 2) {
    // inteligencia: a field of points
    for (let y = inner.y; y <= inner.y + inner.d + 0.1; y += inner.d / 6) for (let x = inner.x; x <= inner.x + inner.w + 0.1; x += inner.w / 6) dots.push(at([x, y, top]));
  } else {
    // estrategia: rings around one point
    pattern = [12, 24, 36].map((r) => circleOnTop(0, 0, r, top, P, 64)).join("");
  }
  return {
    halo: slabOf(PLAN, z, T, P).fill,
    slab: slabOf(PLAN, z, T, P, 8, 0.8),
    groove: planOutline(insetPlan(PLAN, 5), top, P),
    frame: planOutline(inner, top, P),
    pattern,
    dots,
    ticksMinor: ticks.minor.join(""),
    ticksMajor: ticks.major.join(""),
    pins: PINS.map(([x, y]) => cylinder(x!, y!, 2.4, top, 2, P, 16)),
    center: i === 3 ? cylinder(0, 0, 3.4, top, 1.4, P, 24) : null,
  };
}

const PLATES = LAYERS.map((_, i) => plate(i));

export default function LayersFigure() {
  return (
    <svg className="iso-svg layers__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cuatro placas apiladas de un mismo instrumento: operación, sistemas, inteligencia y estrategia, de abajo hacia arriba." data-ez={EZ.join(",")}>
      {PLATES.map((p, i) => (
        <g key={i} data-layer={i} data-dz={i * EXPLODE}>
          <path className="iso-halo" d={p.halo} style={{ opacity: 0.5 }} />
          <Solid paths={p.slab} tone={i === 3 ? "hi" : "mid"} crease="faint" />
          <Line d={p.groove} tone="lo" />
          <Line d={p.frame} tone="faint" />
          {p.pattern ? <Line d={p.pattern} tone={i === 3 ? "mid" : "lo"} /> : null}
          {p.dots.length ? <Dots points={p.dots} size={0.9} tone="mid" /> : null}
          <Line d={p.ticksMinor} tone="faint" />
          <Line d={p.ticksMajor} tone="lo" />
          {p.pins.map((pin, k) => <Solid key={k} paths={pin} tone="mid" crease="faint" />)}
          {p.center ? <Solid paths={p.center} tone="hi" crease="none" lit /> : null}
        </g>
      ))}
    </svg>
  );
}
