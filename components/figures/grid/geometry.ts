import { cylinder, depthOf, fitProjection, insetPlan, iso, knurl, onTop, planOutline, sideArc, slabOf, type Flat, type Plan, type Point3 } from "@/components/iso/iso-kit";
import { DEG, circleOnTop, polar, ringTicks } from "../shared";

export const WIDTH = 640;
export const HEIGHT = 470;
export const S = 70; // grid pitch

export const AGENTS = [
  { name: "Dirección", g: [-1, -1] },
  { name: "Finanzas", g: [0, -1] },
  { name: "Comercial", g: [1, 0] },
  { name: "Operaciones", g: [0, 1] },
  { name: "Marca", g: [-1, 1] },
] as const;
const SOCKETS = [[1, -1], [-1, 0], [1, 1]] as const;

export const BASE_PLAN: Plan = { x: -114, y: -114, w: 228, d: 228, r: 14 };
const BASE_H = 9;
const FOOT_H = 4;
const HUB_TOP = 18;
const AGENT_TOP = 26;
const RAIL_H = 2.2;
export const BEAD_Z = RAIL_H + 1.4;

export const P = fitProjection(
  [
    [BASE_PLAN.x, BASE_PLAN.y, -BASE_H - FOOT_H],
    [BASE_PLAN.x + BASE_PLAN.w, BASE_PLAN.y, -BASE_H - FOOT_H],
    [BASE_PLAN.x, BASE_PLAN.y + BASE_PLAN.d, -BASE_H - FOOT_H],
    [BASE_PLAN.x + BASE_PLAN.w, BASE_PLAN.y + BASE_PLAN.d, -BASE_H - FOOT_H],
    [BASE_PLAN.x, BASE_PLAN.y, AGENT_TOP + 4],
  ],
  WIDTH,
  HEIGHT,
  { pad: 26, elevation: 36 },
);

export const at = (p: Point3): Flat => iso(p, P);
export const depth = (p: Point3) => depthOf(p, P);
const join = (l: string[]) => l.join("");

// ── nodes on the grid ──
type Kind = "hub" | "agent" | "socket";
export type GridNode = { key: string; kind: Kind; x: number; y: number; r: number; agent?: number };
export const NODES: GridNode[] = [
  { key: "0,0", kind: "hub", x: 0, y: 0, r: 30 },
  ...AGENTS.map((a, i) => ({ key: a.g.join(","), kind: "agent" as const, x: a.g[0] * S, y: a.g[1] * S, r: 17, agent: i })),
  ...SOCKETS.map((g) => ({ key: g.join(","), kind: "socket" as const, x: g[0] * S, y: g[1] * S, r: 14 })),
];
const byKey = new Map(NODES.map((n) => [n.key, n]));

// ── rails between orthogonal neighbours ──
export const EDGES: [GridNode, GridNode][] = [];
for (const a of NODES)
  for (const b of NODES) {
    const dx = (b.x - a.x) / S;
    const dy = (b.y - a.y) / S;
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) EDGES.push([a, b]);
  }

export const RAILS = EDGES.map(([a, b]) => {
  const horizontal = a.y === b.y;
  const plan: Plan = horizontal
    ? { x: a.x + a.r, y: a.y - 2.8, w: b.x - b.r - (a.x + a.r), d: 5.6, r: 1 }
    : { x: a.x - 2.8, y: a.y + a.r, w: 5.6, d: b.y - b.r - (a.y + a.r), r: 1 };
  const mid: Point3 = [(a.x + b.x) / 2, (a.y + b.y) / 2, RAIL_H / 2];
  const groove = horizontal
    ? onTop([[plan.x + 2, a.y], [plan.x + plan.w - 2, a.y]], RAIL_H, P)
    : onTop([[a.x, plan.y + 2], [a.x, plan.y + plan.d - 2]], RAIL_H, P);
  const studs = horizontal
    ? [at([plan.x + 3.5, a.y - 1.6, RAIL_H]), at([plan.x + plan.w - 3.5, a.y + 1.6, RAIL_H])]
    : [at([a.x + 1.6, plan.y + 3.5, RAIL_H]), at([a.x - 1.6, plan.y + plan.d - 3.5, RAIL_H])];
  return { solid: slabOf(plan, 0, RAIL_H, P, 2, 0.4), groove, studs, depth: depth(mid) };
});

// ── base ──
const FEET = [
  [BASE_PLAN.x + 22, BASE_PLAN.y + 22],
  [BASE_PLAN.x + BASE_PLAN.w - 22, BASE_PLAN.y + 22],
  [BASE_PLAN.x + 22, BASE_PLAN.y + BASE_PLAN.d - 22],
  [BASE_PLAN.x + BASE_PLAN.w - 22, BASE_PLAN.y + BASE_PLAN.d - 22],
];
const CORNER_SCREWS = [
  [BASE_PLAN.x + 9, BASE_PLAN.y + 9],
  [BASE_PLAN.x + BASE_PLAN.w - 9, BASE_PLAN.y + 9],
  [BASE_PLAN.x + 9, BASE_PLAN.y + BASE_PLAN.d - 9],
  [BASE_PLAN.x + BASE_PLAN.w - 9, BASE_PLAN.y + BASE_PLAN.d - 9],
];
const STRIP_Y: Plan = { x: -92, y: 98, w: 184, d: 8, r: 1 };
const STRIP_X: Plan = { x: 98, y: -92, w: 8, d: 184, r: 1 };

function ruler(axis: "x" | "y") {
  const minor: string[] = [];
  const major: string[] = [];
  for (let v = -88; v <= 88; v += 4) {
    const big = v % 44 === 0;
    const len = big ? 5 : 2.6;
    const line = axis === "x" ? onTop([[v, 98], [v, 98 + len]], 0.6, P) : onTop([[98, v], [98 + len, v]], 0.6, P);
    (big ? major : minor).push(line);
  }
  return { minor: join(minor), major: join(major) };
}
const RY = ruler("x");
const RX = ruler("y");
const LABEL: Plan = { x: -104, y: -106, w: 40, d: 10, r: 1.5 };

export const BASE = {
  halo: slabOf(BASE_PLAN, -BASE_H - FOOT_H, BASE_H, P).fill,
  feet: FEET.map(([x, y]) => [cylinder(x!, y!, 10, -BASE_H - FOOT_H, 1.4, P, 24), cylinder(x!, y!, 8, -BASE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24)]),
  slab: slabOf(BASE_PLAN, -BASE_H, BASE_H, P, 8, 1.6),
  groove: planOutline(insetPlan(BASE_PLAN, 5), 0, P),
  inner: planOutline(insetPlan(BASE_PLAN, 16), 0, P),
  screws: CORNER_SCREWS.map(([x, y]) => at([x!, y!, 0])),
  screwRings: join(CORNER_SCREWS.map(([x, y]) => circleOnTop(x!, y!, 2.3, 0, P, 16))),
  strips: [slabOf(STRIP_Y, 0, 0.6, P, 2), slabOf(STRIP_X, 0, 0.6, P, 2)],
  ticksMinor: RY.minor + RX.minor,
  ticksMajor: RY.major + RX.major,
  label: slabOf(LABEL, 0, 0.8, P, 3),
  labelLine: planOutline(insetPlan(LABEL, 1.5), 0.8, P),
  labelRule: join([0, 1, 2].map((row) => onTop([[LABEL.x + 7, LABEL.y + 3.4 + row * 2.1], [LABEL.x + (row === 1 ? 24 : 32), LABEL.y + 3.4 + row * 2.1]], 0.8, P))),
  labelScrews: [at([LABEL.x + 3, LABEL.y + LABEL.d / 2, 0.8]), at([LABEL.x + LABEL.w - 3, LABEL.y + LABEL.d / 2, 0.8])],
};

// ── hub: the shared context ──
const HUB_TICKS = ringTicks(0, 0, 20.5, 24, 72, 6, HUB_TOP, P);
export const HUB_LEDS = Array.from({ length: 24 }, (_, i) => {
  const [x, y] = polar(15, 0, (i / 24) * Math.PI * 2 - Math.PI / 2);
  return at([x, y, HUB_TOP]);
});
export const HUB = {
  halo: cylinder(0, 0, 32, 0, 0.1, P, 48).fill,
  pedestal: cylinder(0, 0, 30, 0, 4, P, 72, 0.8),
  screws: Array.from({ length: 8 }, (_, i) => polar(27, 0, (i * 45 + 22.5) * DEG)).map(([x, y]) => at([x, y, 4])),
  housing: cylinder(0, 0, 24, 4, 11, P, 72),
  seam: sideArc(0, 0, 24, 9.5, P, 48),
  cap: cylinder(0, 0, 26, 15, 3, P, 72, 0.6),
  ticksMinor: HUB_TICKS.minor,
  ticksMajor: HUB_TICKS.major,
  ring: circleOnTop(0, 0, 11, HUB_TOP, P, 48),
  grid: [-5.5, 0, 5.5].flatMap((y) => [-5.5, 0, 5.5].filter((x) => x !== 0 || y !== 0).map((x) => at([x, y, HUB_TOP]))),
  center: cylinder(0, 0, 2.2, HUB_TOP, 1.2, P, 20),
  depth: depth([0, 0, 8]),
};

// ── agents: one per decision maker ──
export const AGENT_ART = NODES.filter((n) => n.kind === "agent").map((n) => {
  const t = ringTicks(n.x, n.y, 8.5, 11.4, 24, 6, AGENT_TOP, P);
  return {
    node: n,
    depth: depth([n.x, n.y, 10]),
    halo: cylinder(n.x, n.y, 18, 0, 0.1, P, 32).fill,
    pedestal: cylinder(n.x, n.y, 17, 0, 3, P, 48, 0.5),
    screws: [45, 135, 225, 315].map((a) => polar(15, 0, a * DEG)).map(([x, y]) => at([n.x + x, n.y + y, 3])),
    body: cylinder(n.x, n.y, 12.5, 3, 21, P, 48),
    seams: sideArc(n.x, n.y, 12.5, 9, P, 32) + sideArc(n.x, n.y, 12.5, 15, P, 32),
    knurl: knurl(n.x, n.y, 12.5, 19.5, 24, 44, P),
    cap: cylinder(n.x, n.y, 13.5, 24, 2, P, 48, 0.5),
    ticksMinor: t.minor,
    ticksMajor: t.major,
    eye: cylinder(n.x, n.y, 3.4, AGENT_TOP, 1.4, P, 24),
    flash: at([n.x, n.y, AGENT_TOP + 1.2]),
  };
});

export const SOCKET_ART = NODES.filter((n) => n.kind === "socket").map((n) => ({
  depth: depth([n.x, n.y, 1]),
  pedestal: cylinder(n.x, n.y, 14, 0, 2, P, 48, 0.5),
  ring: circleOnTop(n.x, n.y, 10, 2, P, 40),
  bore: circleOnTop(n.x, n.y, 3.4, 2, P, 24),
  screws: [0, 90, 180, 270].map((a) => polar(11.8, 0, (a + 45) * DEG)).map(([x, y]) => at([n.x + x, n.y + y, 2])),
}));

// ── routing on the grid ──
const neighbours = (k: string) => {
  const n = byKey.get(k)!;
  return EDGES.filter(([a, b]) => a === n || b === n).map(([a, b]) => (a === n ? b : a).key);
};
function bfs(from: string, to: string): GridNode[] {
  const prev = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const k = queue.shift()!;
    if (k === to) break;
    for (const n of neighbours(k)) if (!prev.has(n)) (prev.set(n, k), queue.push(n));
  }
  const out: GridNode[] = [];
  for (let k: string | null = to; k; k = prev.get(k) ?? null) out.unshift(byKey.get(k)!);
  return out;
}

export function routeOf(a: number, b: number) {
  const src = NODES.find((n) => n.agent === a)!;
  const dst = NODES.find((n) => n.agent === b)!;
  const path = [...bfs(src.key, "0,0"), ...bfs("0,0", dst.key).slice(1)];
  const lengths = path.slice(1).map((n, i) => Math.hypot(n.x - path[i]!.x, n.y - path[i]!.y));
  const total = lengths.reduce((s, l) => s + l, 0);
  const hubAt = lengths.slice(0, path.findIndex((n) => n.key === "0,0")).reduce((s, l) => s + l, 0);
  return { path, lengths, total, hubAt };
}

export function pointOn(route: ReturnType<typeof routeOf>, d: number): { p: Point3; hidden: number } {
  let rest = d;
  for (let i = 0; i < route.lengths.length; i++) {
    const l = route.lengths[i]!;
    if (rest <= l || i === route.lengths.length - 1) {
      const a = route.path[i]!;
      const b = route.path[i + 1]!;
      const t = Math.min(1, rest / l);
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      // how far inside a node the bead is (0 = on the rail, 1 = deep inside)
      const inA = 1 - Math.min(1, Math.max(0, (Math.hypot(x - a.x, y - a.y) - a.r + 3) / 5));
      const inB = 1 - Math.min(1, Math.max(0, (Math.hypot(x - b.x, y - b.y) - b.r + 3) / 5));
      return { p: [x, y, BEAD_Z], hidden: Math.max(inA, inB) };
    }
    rest -= l;
  }
  const last = route.path.at(-1)!;
  return { p: [last.x, last.y, BEAD_Z], hidden: 1 };
}
