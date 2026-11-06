"use client";

import { useId } from "react";

/**
 * The BLANK · NØDE · GRID wordmarks, drawn as one monoline geometric stroke, as in the brand lockup:
 * a crossbar-less Λ in BLANK, a slashed Ø in NØDE, wide tracking and a registered mark.
 * Letters are centre-line paths on a 100-unit cap height. Stems overshoot and a clip path cuts every
 * stroke flat at the baseline and the cap height, so joins and ends are crisp at any size.
 */

const S = 11; // stroke
const GAP = 30; // tracking between letters
const L = S / 2; // a bar starting here lines up with the outer edge of a stem centred on x = 6 - 0.5

const GLYPHS: Record<string, { w: number; d: string }> = {
  B: { w: 78, d: `M6 -10V110M${L} ${L}H46a20.5 20.5 0 0 1 0 41H6M6 47.5H50a23.25 23.25 0 0 1 0 47H${L}` },
  L: { w: 60, d: `M6 -10V94.5H62` },
  A: { w: 84, d: "M-2 112L42 -4L86 112" },
  N: { w: 80, d: "M6 112V0L74 100V-12" },
  K: { w: 70, d: "M6 -10V110M68 -6L11 52L70 106" },
  Ø: { w: 100, d: "M50 6a44 44 0 1 0 0.01 0ZM8 106L92 -6" },
  D: { w: 88, d: `M6 -10V110M${L} ${L}H40a44.5 44.5 0 0 1 0 89H${L}` },
  E: { w: 62, d: `M6 -10V110M${L} ${L}H64M${L} 50H58M${L} 94.5H64` },
  G: { w: 100, d: "M86.1 24.8A44 44 0 1 0 94 50H56" },
  R: { w: 74, d: `M6 110V-10M${L} ${L}H46a21.5 21.5 0 0 1 0 43H6M40 49L74 108` },
  I: { w: 12, d: "M6 -10V110" },
};

export default function Wordmark({ name, className, registered = true, title }: { name: string; className?: string; registered?: boolean; title?: string }) {
  const id = `wm${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  let x = 0;
  const parts = [...name.toUpperCase()].map((c, i) => {
    const g = GLYPHS[c];
    if (!g) return null;
    const el = <path key={i} d={g.d} transform={`translate(${x} 0)`} />;
    x += g.w + GAP;
    return el;
  });
  const width = x - GAP;
  return (
    <span className={className ? `wordmark-svg ${className}` : "wordmark-svg"} role="img" aria-label={title ?? `${name}®`}>
      <svg viewBox={`-6 0 ${width + 12} 100`} preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={id} clipPathUnits="userSpaceOnUse">
            <rect x={-6} y={0} width={width + 12} height={100} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id})`} fill="none" stroke="currentColor" strokeWidth={S} strokeLinejoin="miter" strokeMiterlimit={8} strokeLinecap="butt">
          {parts}
        </g>
      </svg>
      {registered ? <span className="wordmark-svg__r" aria-hidden="true">®</span> : null}
    </span>
  );
}
