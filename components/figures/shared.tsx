import * as React from "react";
import { extrude, iso, onTop, pathOf, roundedPlan, type Flat, type Plane, type Point3, type Projection, type SolidPaths } from "@/components/iso/iso-kit";

export const DEG = Math.PI / 180;

/** A rounded rectangle centred on (cx, cy), `len` along the direction `angle`, `wid` across it. */
export function rotatedRing(cx: number, cy: number, len: number, wid: number, angle: number, r: number, steps = 4): Plane[] {
  const base = roundedPlan({ x: -len / 2, y: -wid / 2, w: len, d: wid, r }, steps);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return base.map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c] as Plane);
}

export const rotatedSlab = (cx: number, cy: number, len: number, wid: number, angle: number, r: number, z: number, h: number, P: Projection, bevel = 0) =>
  extrude(rotatedRing(cx, cy, len, wid, angle, r), z, h, P, { convex: true, bevel });

export const rotatedOutline = (cx: number, cy: number, len: number, wid: number, angle: number, r: number, z: number, P: Projection) =>
  onTop(rotatedRing(cx, cy, len, wid, angle, r), z, P, true);

/** Point at distance `along` on direction `angle` and `across` perpendicular to it. */
export const polar = (along: number, across: number, angle: number): Plane => [
  along * Math.cos(angle) - across * Math.sin(angle),
  along * Math.sin(angle) + across * Math.cos(angle),
];

export const seg = (a: Point3, b: Point3, P: Projection) => pathOf([iso(a, P), iso(b, P)]);

export function circleOnTop(cx: number, cy: number, r: number, z: number, P: Projection, steps = 40) {
  const pts: Flat[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push(iso([cx + r * Math.cos(a), cy + r * Math.sin(a), z], P));
  }
  return pathOf(pts, true);
}

/** Radial ticks on a horizontal face around (cx, cy). */
export function ringTicks(cx: number, cy: number, r0: number, r1: number, count: number, every: number, z: number, P: Projection, short = 0.55) {
  const minor: string[] = [];
  const major: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const big = i % every === 0;
    const inner = big ? r0 : r1 - (r1 - r0) * short;
    const line = onTop([[cx + inner * Math.cos(a), cy + inner * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]], z, P);
    (big ? major : minor).push(line);
  }
  return { minor: minor.join(""), major: major.join("") };
}

/** A solid whose paths are rewritten every frame (a growing column). Every path element is always present. */
export const LiveSolid = React.forwardRef<SVGGElement, { paths: SolidPaths; tone?: string; lit?: boolean }>(function LiveSolid(
  { paths, tone = "hi", lit = false },
  ref,
) {
  return (
    <g ref={ref} className="iso-solid" data-lit={lit ? "" : undefined}>
      <path className="iso-fill" data-k="fill" d={paths.fill} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} className="iso-shade" data-shade={i} data-k={`s${i}`} d={paths.shades[i] || "M0 0"} />
      ))}
      <path className="iso-top" data-k="top" d={paths.top} />
      <path className="iso-line iso-crease" data-tone="faint" data-k="crease" d={paths.crease || "M0 0"} />
      <path className="iso-line iso-edge" data-tone={tone} data-k="outline" d={paths.outline} />
    </g>
  );
});

export function applySolid(group: SVGGElement | null, paths: SolidPaths) {
  if (!group) return;
  const set = (k: string, d: string | undefined) => group.querySelector(`[data-k="${k}"]`)?.setAttribute("d", d || "M0 0");
  set("fill", paths.fill);
  paths.shades.forEach((d, i) => set(`s${i}`, d));
  set("top", paths.top);
  set("crease", paths.crease);
  set("outline", paths.outline);
}

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Creates a glowing bead (two circles) as raw SVG, so it can be moved between depth slots without React. */
export function makeBead(): SVGGElement {
  const NS = "http://www.w3.org/2000/svg";
  const g = document.createElementNS(NS, "g");
  g.setAttribute("class", "fig-bead");
  const glow = document.createElementNS(NS, "circle");
  glow.setAttribute("r", "5");
  glow.setAttribute("class", "fig-bead__glow");
  const core = document.createElementNS(NS, "circle");
  core.setAttribute("r", "1.9");
  core.setAttribute("class", "fig-bead__core");
  g.append(glow, core);
  g.style.opacity = "0";
  return g;
}

/** Moves a bead to a screen point and into the depth slot that matches its depth. */
export function placeBead(bead: SVGGElement, at: Flat, depth: number, depths: number[], slots: (SVGGElement | null)[], alpha: number) {
  let k = 0;
  while (k < depths.length && depths[k]! < depth) k++;
  const slot = slots[k];
  if (slot && bead.parentNode !== slot) slot.appendChild(bead);
  bead.setAttribute("transform", `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`);
  bead.style.opacity = alpha.toFixed(3);
}
