"use client";

import { useEffect, useRef } from "react";

const C = 250;
const R = 165;
const agents = ["Dirección", "Finanzas", "Comercial", "Operaciones", "Marca"].map((label, i) => {
  const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
  return { label, x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
});

const edges: [number, number][] = [];
for (let i = 0; i < agents.length; i++) for (let j = i + 1; j < agents.length; j++) edges.push([i, j]);

type Pulse = { edge: number; t: number; speed: number; dir: 1 | -1 };

export default function GridNetwork() {
  const pulsesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = pulsesRef.current;
    if (!g || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const NS = "http://www.w3.org/2000/svg";
    const pulses: (Pulse & { el: SVGCircleElement })[] = Array.from({ length: 7 }, (_, i) => {
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("r", "2.6");
      el.setAttribute("class", "pulse");
      g.appendChild(el);
      return { el, edge: (i * 3) % edges.length, t: Math.random(), speed: 0.004 + Math.random() * 0.004, dir: i % 2 ? 1 : -1 };
    });

    let raf = 0;
    let running = true;
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) raf = requestAnimationFrame(tick);
    });
    io.observe(g.ownerSVGElement!);

    function tick() {
      for (const p of pulses) {
        p.t += p.speed;
        if (p.t >= 1) {
          p.t = 0;
          p.edge = Math.floor(Math.random() * edges.length);
          p.dir = Math.random() > 0.5 ? 1 : -1;
        }
        const [a, b] = edges[p.edge];
        const [s, e] = p.dir === 1 ? [agents[a], agents[b]] : [agents[b], agents[a]];
        p.el.setAttribute("cx", String(s.x + (e.x - s.x) * p.t));
        p.el.setAttribute("cy", String(s.y + (e.y - s.y) * p.t));
        p.el.setAttribute("opacity", String(Math.sin(p.t * Math.PI)));
      }
      if (running) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      pulses.forEach((p) => p.el.remove());
    };
  }, []);

  return (
    <svg viewBox="0 0 500 500" role="img" aria-label="Red de agentes de GRID">
      <defs>
        <radialGradient id="net-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R + 40} className="net-ring" />
      <circle cx={C} cy={C} r={R - 70} className="net-ring net-ring--dash" />
      <circle cx={C} cy={C} r="120" fill="url(#net-core)" />
      {edges.map(([a, b], i) => (
        <line key={i} x1={agents[a].x} y1={agents[a].y} x2={agents[b].x} y2={agents[b].y} className="net-edge" />
      ))}
      {agents.map((a) => (
        <line key={a.label} x1={a.x} y1={a.y} x2={C} y2={C} className="net-spoke" />
      ))}
      <g ref={pulsesRef} />
      <g className="net-center">
        {[-6, 0, 6].flatMap((y) => [-6, 0, 6].map((x) => <circle key={`${x}${y}`} cx={C + x} cy={C + y - 6} r="1.6" />))}
        <text x={C} y={C + 20}>GRID</text>
      </g>
      {agents.map((a) => {
        const below = a.y > C;
        return (
          <g key={a.label} className="net-agent">
            <circle cx={a.x} cy={a.y} r="16" className="net-agent__halo" />
            <circle cx={a.x} cy={a.y} r="5" className="net-agent__dot" />
            <text x={a.x} y={below ? a.y + 36 : a.y - 26}>{a.label}</text>
            <text x={a.x} y={below ? a.y + 50 : a.y - 40} className="net-agent__sub">AGENTE</text>
          </g>
        );
      })}
    </svg>
  );
}
