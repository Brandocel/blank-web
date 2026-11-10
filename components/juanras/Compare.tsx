"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  /** Accessible name of the slider. */
  label: string;
  /** Resting position of the divider, 0–100. */
  start?: number;
  /** When set, the divider sweeps in from this position on load. */
  from?: number;
  /** The divider follows the mouse without pressing (touch always drags the knob). */
  follow?: boolean;
  /** Shown to the left of the divider. */
  under: React.ReactNode;
  /** Shown to the right of the divider. */
  over: React.ReactNode;
  children?: React.ReactNode;
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** Two layers and a divider you move: the left side is `under`, the right side is `over`. */
export default function Compare({ className = "", label, start = 50, from, follow = false, under, over, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    const k = knob.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cur = reduce || from == null ? start : from;
    let target = cur;
    let speed = 2.4; // per second: slow for the opening sweep, quick once someone takes over
    let raf = 0;
    let last = 0;
    let dragging = false;

    const paint = () => {
      el.style.setProperty("--x", `${cur.toFixed(2)}%`);
      k.setAttribute("aria-valuenow", String(Math.round(cur)));
    };
    // Eased by elapsed time, not by frame, so it takes the same time on any screen.
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      cur += (target - cur) * (1 - Math.exp(-speed * dt));
      if (Math.abs(target - cur) < 0.05) {
        cur = target;
        raf = 0;
      } else raf = requestAnimationFrame(tick);
      paint();
    };
    const go = (v: number) => {
      target = clamp(v);
      if (reduce) {
        cur = target;
        paint();
      } else if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const at = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    };

    paint();
    const sweep = window.setTimeout(() => go(start), 600);

    const take = () => {
      window.clearTimeout(sweep);
      speed = 11;
    };
    const move = (e: PointerEvent) => {
      if (!dragging && !(follow && e.pointerType === "mouse")) return;
      take();
      go(at(e));
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      k.setPointerCapture(e.pointerId);
      take();
      go(at(e));
    };
    const up = () => {
      dragging = false;
    };
    const key = (e: KeyboardEvent) => {
      const step = e.key === "ArrowLeft" ? -5 : e.key === "ArrowRight" ? 5 : e.key === "Home" ? -100 : e.key === "End" ? 100 : 0;
      if (!step) return;
      e.preventDefault();
      take();
      go(target + step);
    };

    el.addEventListener("pointermove", move);
    k.addEventListener("pointerdown", down);
    k.addEventListener("pointerup", up);
    k.addEventListener("pointercancel", up);
    k.addEventListener("keydown", key);
    return () => {
      window.clearTimeout(sweep);
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      k.removeEventListener("pointerdown", down);
      k.removeEventListener("pointerup", up);
      k.removeEventListener("pointercancel", up);
      k.removeEventListener("keydown", key);
    };
  }, [start, from, follow]);

  return (
    <div ref={root} className={`jr-compare ${className}`} style={{ "--x": `${start}%` } as React.CSSProperties}>
      <div className="jr-compare__under">{under}</div>
      <div className="jr-compare__over">{over}</div>
      {children}
      <div className="jr-compare__bar" aria-hidden="true" />
      <div ref={knob} className="jr-compare__knob" role="slider" tabIndex={0} aria-label={label} aria-orientation="horizontal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={start}>
        <span aria-hidden="true">A</span>
        <span aria-hidden="true">B</span>
      </div>
    </div>
  );
}
