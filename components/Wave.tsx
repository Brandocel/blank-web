"use client";

import { useEffect, useRef } from "react";

/** A field of points rolling like a slow swell, seen in perspective. Pauses offscreen; one still frame under reduced motion. */
export default function Wave() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLS = 46;
    const ROWS = 22;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let t = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const pts: [number, number, number][][] = [];
      for (let r = 0; r < ROWS; r++) {
        const row: [number, number, number][] = [];
        const z = 1 + r * 0.32; // depth: rows recede
        for (let c = 0; c < COLS; c++) {
          const x = (c / (COLS - 1) - 0.5) * 9;
          const y = Math.sin(x * 0.7 + t * 0.6) * 0.45 + Math.sin(r * 0.45 - t * 0.9 + x * 0.25) * 0.35 + Math.cos(x * 0.33 - r * 0.2 + t * 0.4) * 0.3;
          const sx = w * 0.5 + (x / z) * w * 0.22 + w * 0.12;
          const sy = h * 0.2 + (r * 0.32 * h * 0.11) / z + (-y / z) * h * 0.22 + h * 0.12;
          row.push([sx, sy, 1 / z]);
        }
        pts.push(row);
      }
      ctx.lineWidth = 0.6;
      for (let r = 0; r < ROWS; r++) {
        const row = pts[r]!;
        ctx.beginPath();
        row.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + 0.18 * row[0]![2]})`;
        ctx.stroke();
      }
      for (let c = 0; c < COLS; c += 3) {
        ctx.beginPath();
        for (let r = 0; r < ROWS; r++) {
          const [x, y] = pts[r]![c]!;
          r ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.stroke();
      }
      for (const row of pts)
        for (let c = 0; c < row.length; c++) {
          const [x, y, k] = row[c]!;
          const bright = (Math.sin(c * 1.7 + t * 1.3 + k * 9) + 1) / 2;
          ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.75 * k * bright})`;
          ctx.beginPath();
          ctx.arc(x, y, 0.5 + 1.3 * k * bright, 0, Math.PI * 2);
          ctx.fill();
        }
    };

    const loop = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      t += dt;
      draw();
      if (visible) raf = requestAnimationFrame(loop);
    };

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting) && !still;
      cancelAnimationFrame(raf);
      last = 0;
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="art art--wave" aria-hidden="true" />;
}
