import { cylinder, depthOf, fitProjection, iso, knurl, onTop, sideArc, slabOf, type Flat, type Point3 } from "@/components/iso/iso-kit";
import { DEG, circleOnTop, polar, ringTicks, rotatedOutline, rotatedSlab, seg } from "../shared";

export const WIDTH = 640;
export const HEIGHT = 470;

/** The eight places a person's information lives today. */
export const SOURCES = ["WhatsApp", "Correo", "Documentos", "Calendario", "Contactos", "Notas", "Audios", "Contratos"] as const;

export const BASE_R = 120;
export const BASE_H = 8;
export const FOOT_H = 4;
export const CART_R = 78; // radial centre of each source cartridge
export const CHANNEL = { from: 62, to: 37 }; // bead travel, radial
export const CORE = { pedestal: 36, housing: 26, cap: 28, column: 13 };
export const Z = { pedestal: 4, housing: 28, cap: 31 };
export const COLUMN_MIN = 8;
export const COLUMN_MAX = 44;

const angleOf = (i: number) => (i * 45 + 22.5) * DEG;

export const P = fitProjection(
  [
    ...Array.from({ length: 48 }, (_, i): [number, number, number][] => {
      const a = (i / 48) * Math.PI * 2;
      return [
        [BASE_R * Math.cos(a), BASE_R * Math.sin(a), -BASE_H - FOOT_H],
        [BASE_R * Math.cos(a), BASE_R * Math.sin(a), 0],
      ];
    }).flat(),
    [0, 0, Z.cap + COLUMN_MAX + 4],
  ],
  WIDTH,
  HEIGHT,
  { pad: 30 },
);

export const at = (p: Point3): Flat => iso(p, P);
export const depth = (p: Point3) => depthOf(p, P);

const join = (list: string[]) => list.join("");

// ── Base ──────────────────────────────────────────────
const FEET = [45, 135, 225, 315].map((a) => polar(94, 0, a * DEG));
const SCREWS = [0, 90, 180, 270].map((a) => polar(114, 0, a * DEG));
const RIM = ringTicks(0, 0, 103, 109, 96, 8, 0, P);

export const BASE = {
  halo: cylinder(0, 0, BASE_R, -BASE_H - FOOT_H, BASE_H, P, 72).fill,
  feet: FEET.map(([x, y]) => [cylinder(x, y, 9, -BASE_H - FOOT_H, 1.4, P, 24), cylinder(x, y, 7, -BASE_H - FOOT_H + 1.4, FOOT_H - 1.4, P, 24)]),
  slab: cylinder(0, 0, BASE_R, -BASE_H, BASE_H, P, 96, 1.4),
  band: sideArc(0, 0, BASE_R, -BASE_H / 2, P, 64),
  groove: circleOnTop(0, 0, BASE_R - 5, 0, P, 96),
  inner: circleOnTop(0, 0, 100, 0, P, 96),
  rimMinor: RIM.minor,
  rimMajor: RIM.major,
  screws: SCREWS.map(([x, y]) => at([x, y, 0])),
  screwRings: join(SCREWS.map(([x, y]) => circleOnTop(x, y, 2.2, 0, P, 16))),
  floor: circleOnTop(0, 0, 44, 0, P, 64),
};

// ── Label plate (back) and lamp strip (front): ENTENDER · PROPONER · CONFIRMAR · EJECUTAR · REGISTRAR ──
const PLATE_A = 225 * DEG;
const [PX, PY] = polar(92, 0, PLATE_A);
export const PLATE = {
  body: rotatedSlab(PX, PY, 10, 34, PLATE_A, 1.5, 0, 0.8, P),
  line: rotatedOutline(PX, PY, 7, 31, PLATE_A, 1, 0.8, P),
  rule: join([-2, 0, 2].map((k, i) => {
    const a = polar(92 + k, -11, PLATE_A);
    const b = polar(92 + k, i === 1 ? 4 : 9, PLATE_A);
    return onTop([a, b], 0.8, P);
  })),
  screws: [-14, 14].map((s) => {
    const [x, y] = polar(92, s, PLATE_A);
    return at([x, y, 0.8]);
  }),
};

const LAMP_A = 45 * DEG;
export const LAMPS = [-2, -1, 0, 1, 2].map((k) => {
  const [x, y] = polar(97, k * 7.5, LAMP_A);
  return { solid: cylinder(x, y, 2.6, 0, 1.4, P, 20), dot: at([x, y, 1.4]) };
});
const [SX, SY] = polar(97, 0, LAMP_A);
export const LAMP_TRAY = rotatedSlab(SX, SY, 9, 44, LAMP_A, 2, 0, 0.6, P);

// ── Channels: one pair of grooves from each cartridge to the core ──
export const CHANNELS = SOURCES.map((_, i) => {
  const a = angleOf(i);
  const side = (k: number) => onTop([polar(CHANNEL.from + 1, k, a), polar(CORE.pedestal, k, a)], 0, P);
  return join([side(-2.4), side(2.4)]);
});

// ── Cartridges ──
export const CARTRIDGES = SOURCES.map((name, i) => {
  const a = angleOf(i);
  const [cx, cy] = polar(CART_R, 0, a);
  const knob = polar(CART_R + 7, 0, a);
  const ruleLine = (k: number, len: number) => onTop([polar(CART_R - 9, k, a), polar(CART_R - 9 + len, k, a)], 12, P);
  return {
    name,
    angle: a,
    depth: depth([cx, cy, 6]),
    socket: rotatedSlab(cx, cy, 32, 21, a, 3, 0, 2, P, 0.5),
    socketScrews: [-8.5, 8.5].map((k) => {
      const [x, y] = polar(CART_R + 13, k, a);
      return at([x, y, 2]);
    }),
    body: rotatedSlab(cx, cy, 27, 16, a, 2.4, 2, 10, P, 0.6),
    slot: rotatedOutline(cx - Math.cos(a) * 0, cy, 23, 12, a, 1.6, 12, P),
    rule: join([ruleLine(-2.5, 10), ruleLine(0, 7), ruleLine(2.5, 10)]),
    led: at([...polar(CART_R - 11, 0, a), 12] as Point3),
    knob: cylinder(knob[0], knob[1], 3.2, 12, 3, P, 20),
    knurl: knurl(knob[0], knob[1], 3.2, 12, 15, 18, P),
    mouth: (() => {
      const [x, y] = polar(CHANNEL.from + 1, 0, a);
      return at([x, y, 1]);
    })(),
  };
});

// ── Core ──
const PED_SCREWS = Array.from({ length: 8 }, (_, i) => polar(32, 0, (i * 45 + 22.5) * DEG));
const CAP_TICKS = ringTicks(0, 0, 21.5, 26, 60, 5, Z.cap, P);

export const CORE_ART = {
  halo: cylinder(0, 0, CORE.pedestal + 2, 0, 0.1, P, 48).fill,
  pedestal: cylinder(0, 0, CORE.pedestal, 0, Z.pedestal, P, 72, 0.8),
  pedScrews: PED_SCREWS.map(([x, y]) => at([x, y, Z.pedestal])),
  housing: cylinder(0, 0, CORE.housing, Z.pedestal, Z.housing - Z.pedestal, P, 72),
  seams: join([10, 21].map((z) => sideArc(0, 0, CORE.housing, z, P, 48))),
  knurl: knurl(0, 0, CORE.housing, 23, Z.housing, 72, P),
  window: (() => {
    // a small inspection window on the housing, facing the viewer
    const a = 45 * DEG;
    const pts: Point3[] = [-14, -6, 6, 14].map((d) => [CORE.housing * Math.cos(a + d * DEG * 0.5), CORE.housing * Math.sin(a + d * DEG * 0.5), 0]);
    return seg([pts[0]![0], pts[0]![1], 13], [pts[0]![0], pts[0]![1], 18], P) + seg([pts[3]![0], pts[3]![1], 13], [pts[3]![0], pts[3]![1], 18], P);
  })(),
  cap: cylinder(0, 0, CORE.cap, Z.housing, Z.cap - Z.housing, P, 72, 0.6),
  capMinor: CAP_TICKS.minor,
  capMajor: CAP_TICKS.major,
  capRing: circleOnTop(0, 0, 19.5, Z.cap, P, 64),
  collar: cylinder(0, 0, CORE.column + 2.2, Z.cap, 1.6, P, 48),
};

export function columnPaths(h: number) {
  const top = Z.cap + 1.6 + h;
  const layers: string[] = [];
  for (let z = Z.cap + 1.6 + 3; z < top - 1; z += 3) layers.push(sideArc(0, 0, CORE.column, z, P, 32));
  return {
    body: cylinder(0, 0, CORE.column, Z.cap + 1.6, h, P, 48),
    layers: layers.join(""),
    point: cylinder(0, 0, 4, top, 2, P, 28),
    glow: at([0, 0, top + 2]),
  };
}

/** World position of a bead on channel i at travel t (0 at the cartridge, 1 at the core). */
export function beadAt(i: number, t: number): Point3 {
  const r = CHANNEL.from + (CHANNEL.to - CHANNEL.from) * t;
  const [x, y] = polar(r, 0, angleOf(i));
  return [x, y, 1.6];
}

export const CORE_DEPTH = depth([0, 0, 10]);
