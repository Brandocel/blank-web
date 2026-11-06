/**
 * Generative, photographic-feeling art for the Insights and Cases cards: monochrome, lit, with film
 * grain laid over in CSS. Each kind appears once per page, so its gradient ids stay unique.
 */

export type ArtKind = "waves" | "planes" | "moon" | "light" | "arch" | "pearl" | "palm";

const r1 = (n: number) => Math.round(n * 10) / 10;

function Waves() {
  const lines = Array.from({ length: 56 }, (_, i) => {
    const pts: string[] = [];
    for (let x = -80; x <= 480; x += 6) {
      const env = 0.35 + 0.65 * Math.sin(((x + 80) / 560) * Math.PI);
      const y = 18 + i * 4.8 + 30 * Math.sin(x * 0.016 + i * 0.11) * env + 16 * Math.sin(x * 0.0065 - i * 0.06);
      pts.push(`${x},${r1(y)}`);
    }
    return { d: `M${pts.join("L")}`, o: 0.12 + 0.6 * Math.pow(Math.sin((i / 55) * Math.PI), 1.5) };
  });
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="wv-light" cx="78%" cy="20%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wv-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".25" />
          <stop offset=".65" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="#060606" />
      <rect width="400" height="300" fill="url(#wv-light)" />
      <g className="anim-wave" fill="none" stroke="url(#wv-fade)" strokeWidth=".7">
        {lines.map((l, i) => (
          <path key={i} d={l.d} strokeOpacity={l.o} />
        ))}
      </g>
    </svg>
  );
}

function Planes() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pl-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f1ed" />
          <stop offset="1" stopColor="#7d7c78" />
        </linearGradient>
        <linearGradient id="pl-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b3b39" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="pl-c" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bdbcb7" />
          <stop offset="1" stopColor="#5d5c58" />
        </linearGradient>
        <linearGradient id="pl-glint" x1="0" y1="1" x2="1" y2="0">
          <stop offset=".42" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".75" />
          <stop offset=".58" stopColor="#fff" stopOpacity="0" />
          <animateTransform attributeName="gradientTransform" type="translate" values="-0.9 0.9; 0.9 -0.9" dur="5.5s" repeatCount="indefinite" />
        </linearGradient>
        <filter id="pl-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="#0a0a0a" />
      <g>
        <polygon points="40,330 300,-40 380,-40 120,330" fill="#000" opacity=".6" filter="url(#pl-soft)" transform="translate(16 14)" />
        <polygon points="40,330 300,-40 380,-40 120,330" fill="url(#pl-b)" />
        <polygon points="40,330 300,-40 312,-40 52,330" fill="url(#pl-a)" />
        <polygon points="170,330 430,-40 448,-40 188,330" fill="url(#pl-c)" />
        <polygon points="250,330 430,74 430,104 271,330" fill="#1c1c1b" />
        <polygon points="40,330 300,-40 312,-40 52,330" fill="url(#pl-glint)" style={{ mixBlendMode: "screen" }} />
        <polygon points="170,330 430,-40 448,-40 188,330" fill="url(#pl-glint)" style={{ mixBlendMode: "screen" }} />
      </g>
    </svg>
  );
}

function Moon() {
  const stars = Array.from({ length: 64 }, (_, i) => ({ x: (i * 97) % 400, y: (i * 53) % 170, r: i % 7 === 0 ? 1.1 : i % 3 === 0 ? 0.75 : 0.5 }));
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="mn-shade" cx="62%" cy="22%" r="85%">
          <stop offset="0" stopColor="#efeeea" />
          <stop offset=".45" stopColor="#8b8a86" />
          <stop offset=".8" stopColor="#262625" />
          <stop offset="1" stopColor="#0b0b0b" />
        </radialGradient>
        <filter id="mn-surface" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="5" seed="4" />
          <feDiffuseLighting surfaceScale="4.5" lightingColor="#fff" diffuseConstant="1.1">
            <feDistantLight azimuth="225" elevation="38" />
          </feDiffuseLighting>
        </filter>
        <clipPath id="mn-clip">
          <circle cx="250" cy="330" r="220" />
        </clipPath>
        <radialGradient id="mn-glow" cx="62%" cy="100%" r="70%">
          <stop offset=".55" stopColor="#fff" stopOpacity=".1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="#050505" />
      <g className="moon-stars">
        {stars.map((s, i) => (
          <circle
            key={i}
            className="moon-star"
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff"
            style={{ animationDelay: `${-((i * 0.37) % 4).toFixed(2)}s, ${-((i * 1.3) % 18).toFixed(2)}s`, animationDuration: `${(2.4 + (i % 5) * 0.7).toFixed(1)}s, ${(14 + (i % 4) * 4)}s` }}
          />
        ))}
      </g>
      <rect className="anim-breathe" width="400" height="300" fill="url(#mn-glow)" />
      <g>
        <circle cx="250" cy="330" r="220" fill="url(#mn-shade)" />
        <g clipPath="url(#mn-clip)" style={{ mixBlendMode: "multiply" }}>
          <rect x="20" y="100" width="460" height="460" filter="url(#mn-surface)" opacity=".85" />
        </g>
        <circle cx="250" cy="330" r="220" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1" />
      </g>
    </svg>
  );
}

function Light() {
  const bars = [
    { x: 60, w: 10, b: 2.5, o: 1 },
    { x: 128, w: 16, b: 7, o: 0.55 },
    { x: 200, w: 8, b: 1.8, o: 0.95 },
    { x: 262, w: 20, b: 9, o: 0.45 },
    { x: 330, w: 9, b: 2.6, o: 0.8 },
  ];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="lt-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {bars.map((b, i) => (
          <filter key={i} id={`lt-b${i}`} x="-200%" y="-10%" width="500%" height="120%">
            <feGaussianBlur stdDeviation={b.b} />
          </filter>
        ))}
      </defs>
      <rect width="400" height="300" fill="#050505" />
      <g>
        {bars.map((b, i) => (
          <g key={i} opacity={b.o} className="anim-bar" style={{ animationDelay: `${-i * 0.9}s`, animationDuration: `${3.2 + (i % 3) * 0.8}s` }}>
            <rect x={b.x} y="-10" width={b.w} height="320" fill="url(#lt-bar)" filter={`url(#lt-b${i})`} />
            <rect x={b.x + b.w / 2 - 0.6} y="30" width="1.2" height="240" fill="#fff" opacity=".9" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function Arch() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ar-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7f878c" />
          <stop offset="1" stopColor="#c9cdcf" />
        </linearGradient>
        <linearGradient id="ar-lit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f3ef" />
          <stop offset="1" stopColor="#bdbcb6" />
        </linearGradient>
        <linearGradient id="ar-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c4c4a" />
          <stop offset="1" stopColor="#232322" />
        </linearGradient>
        <filter id="ar-soft">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#ar-sky)" />
      <g>
        {/* the lit face, looking up at a corner */}
        <polygon points="40,300 40,118 236,52 236,300" fill="url(#ar-lit)" />
        {/* the shaded return */}
        <polygon points="236,52 400,96 400,300 236,300" fill="url(#ar-shade)" />
        {/* a cast shadow raking across the lit face */}
        <polygon className="anim-shadow" points="40,226 236,128 236,300 40,300" fill="#2b2b2a" opacity=".55" filter="url(#ar-soft)" />
        {/* slab edge and fins */}
        <polyline points="40,118 236,52 400,96" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" />
        {[262, 292, 322, 352, 382].map((x) => (
          <line key={x} x1={x} y1={59 + (x - 236) * 0.27} x2={x} y2="300" stroke="#000" strokeOpacity=".25" strokeWidth="6" />
        ))}
        <line x1="236" y1="52" x2="236" y2="300" stroke="#fff" strokeOpacity=".35" />
      </g>
    </svg>
  );
}

function Pearl() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="pr-backdrop" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#3a3a39" />
          <stop offset=".6" stopColor="#111" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <radialGradient id="pr-body" cx="38%" cy="32%" r="72%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".18" stopColor="#d9d8d4" />
          <stop offset=".55" stopColor="#6e6d69" />
          <stop offset=".85" stopColor="#1d1d1c" />
          <stop offset="1" stopColor="#3c3c3a" />
        </radialGradient>
        <radialGradient id="pr-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#000" stopOpacity=".85" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pr-ref" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="pr-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#pr-backdrop)" />
      <rect y="214" width="400" height="86" fill="#0b0b0b" />
      <ellipse cx="200" cy="222" rx="96" ry="14" fill="url(#pr-floor)" />
      <g className="anim-float">
        <ellipse cx="200" cy="246" rx="70" ry="22" fill="url(#pr-ref)" filter="url(#pr-blur)" />
        <circle cx="200" cy="148" r="74" fill="url(#pr-body)" />
        <ellipse className="anim-glimmer" cx="172" cy="114" rx="22" ry="14" fill="#fff" opacity=".85" filter="url(#pr-blur)" transform="rotate(-30 172 114)" />
        <path d="M140 186a74 74 0 0 0 120 0" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" filter="url(#pr-blur)" />
      </g>
    </svg>
  );
}

function Palm() {
  // fronds radiating from a crown just off the top-left, each a stem with paired leaflets
  const fronds: string[] = [];
  const crown = { x: 30, y: -70 };
  for (let f = 0; f < 10; f++) {
    const ang = (0.08 + f * 0.1) * Math.PI;
    const len = 300 + (f % 3) * 50;
    for (let k = 4; k < 30; k++) {
      const t = k / 30;
      const bend = Math.sin(t * Math.PI) * 30 * (f % 2 ? 1 : -1);
      const sx = crown.x + Math.cos(ang) * len * t - Math.sin(ang) * bend;
      const sy = crown.y + Math.sin(ang) * len * t + Math.cos(ang) * bend;
      const leaf = 46 * Math.sin(t * Math.PI) + 8;
      for (const side of [-1, 1]) {
        const la = ang + side * 0.9 + 0.35;
        const ex = sx + Math.cos(la) * leaf;
        const ey = sy + Math.sin(la) * leaf;
        const nx = -Math.sin(la) * 4;
        const ny = Math.cos(la) * 4;
        fronds.push(`M${r1(sx)} ${r1(sy)}Q${r1((sx + ex) / 2 + nx)} ${r1((sy + ey) / 2 + ny)} ${r1(ex)} ${r1(ey)}Q${r1((sx + ex) / 2 - nx)} ${r1((sy + ey) / 2 - ny)} ${r1(sx)} ${r1(sy)}Z`);
      }
    }
  }
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pm-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9d7d1" />
          <stop offset="1" stopColor="#8c8a85" />
        </linearGradient>
        <radialGradient id="pm-sun" cx="78%" cy="26%" r="55%">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id="pm-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#pm-wall)" />
      <rect width="400" height="300" fill="url(#pm-sun)" />
      <g className="anim-sway" fill="#1d1c1a" opacity=".62" filter="url(#pm-shadow)">
        <path d={fronds.join("")} />
      </g>
      <rect y="262" width="400" height="38" fill="#000" opacity=".25" />
    </svg>
  );
}

const MAP: Record<ArtKind, () => React.JSX.Element> = { waves: Waves, planes: Planes, moon: Moon, light: Light, arch: Arch, pearl: Pearl, palm: Palm };

export default function CardArt({ kind, label }: { kind: ArtKind; label?: string }) {
  const Art = MAP[kind];
  return (
    <div className={`card-art card-art--${kind}`} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Art />
    </div>
  );
}
