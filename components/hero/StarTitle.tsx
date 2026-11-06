"use client";

import { useEffect, useRef } from "react";

/**
 * The hero title, built from stars. Every word of the title is rasterised offscreen in its own font,
 * size and style, sampled into points, and each point becomes a star that flies out of the galaxy's
 * birth point (the hero's --gx/--gy) along a gentle arc and settles into its letter. The real type
 * then fades in over them; the stars stay on the letters and twinkle. The pointer scatters the stars
 * near it and they spring back; scrolling the hero away breaks the letters apart.
 */

type Star = { tx: number; ty: number; sx: number; sy: number; cx: number; cy: number; x: number; y: number; vx: number; vy: number; delay: number; tw: number; size: number };

const FORM_START = 0.55; // s after mount, as the big bang flashes
const FORM_SPAN = 1.7; // s to fly in

export default function StarTitle() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const hero = canvas.parentElement as HTMLElement;
    const title = hero.querySelector<HTMLElement>('[data-hero="title"]');
    const ctx = canvas.getContext("2d");
    if (!title || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // the copy block moves and fades with scroll (Motion); stars are measured without that move and then follow it
    const copy = (title.closest(".hero__copy") as HTMLElement | null) ?? title;
    const copyShift = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(copy).transform === "none" ? undefined : getComputedStyle(copy).transform);
      return { x: m.m41, y: m.m42, o: parseFloat(getComputedStyle(copy).opacity) || 0 };
    };

    let stars: Star[] = [];
    let w = 0, h = 0, dpr = 1;
    let raf = 0, t0 = 0, last = 0, visible = true;
    const mouse = { x: -1e4, y: -1e4, on: false };

    function sample() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = hero.getBoundingClientRect();
      w = box.width;
      h = box.height;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // rasterise each word of the title where it sits, in its own font
      const off = document.createElement("canvas");
      off.width = Math.ceil(w);
      off.height = Math.ceil(h);
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.fillStyle = "#fff";
      o.textBaseline = "alphabetic";
      const walker = document.createTreeWalker(title!, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let tn: Node | null;
      let fontPx = 80;
      const shift = copyShift();
      while ((tn = walker.nextNode())) {
        const text = tn.textContent ?? "";
        const cs = getComputedStyle(tn.parentElement!);
        fontPx = parseFloat(cs.fontSize);
        o.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const ls = parseFloat(cs.letterSpacing) || 0;
        (o as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${ls}px`;
        const re = /\S+/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text))) {
          range.setStart(tn, m.index);
          range.setEnd(tn, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          const met = o.measureText(m[0]);
          const asc = met.fontBoundingBoxAscent ?? fontPx * 0.8;
          const desc = met.fontBoundingBoxDescent ?? fontPx * 0.2;
          // the inline box is the font's content area, centred on the line: its top plus the ascent is the baseline
          const baseline = r.top - box.top - shift.y + (r.height - (asc + desc)) / 2 + asc;
          o.fillText(m[0], r.left - box.left - shift.x, baseline);
        }
      }

      const step = Math.max(3, Math.round(fontPx / 26));
      const img = o.getImageData(0, 0, off.width, off.height).data;
      const gx = (parseFloat(hero.style.getPropertyValue("--gx")) || 72) / 100 * w;
      const gy = (parseFloat(hero.style.getPropertyValue("--gy")) || 55) / 100 * h;
      const next: Star[] = [];
      let seed = 11;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (img[(y * off.width + x) * 4 + 3]! < 90) continue;
          const tx = x + (rnd() - 0.5) * step * 0.6;
          const ty = y + (rnd() - 0.5) * step * 0.6;
          const sx = gx + (rnd() - 0.5) * 30;
          const sy = gy + (rnd() - 0.5) * 30;
          // a control point off the straight path gives each star a curved flight
          const mx = (sx + tx) / 2, my = (sy + ty) / 2;
          const nx = -(ty - sy), ny = tx - sx;
          const nl = Math.hypot(nx, ny) || 1;
          const bend = (rnd() - 0.5) * 0.9 * nl;
          next.push({
            tx, ty, sx, sy,
            cx: mx + (nx / nl) * bend * 0.35,
            cy: my + (ny / nl) * bend * 0.35 - 60,
            x: sx, y: sy, vx: 0, vy: 0,
            delay: (tx / w) * 0.55 + rnd() * 0.35,
            tw: rnd() * Math.PI * 2,
            size: 0.6 + Math.pow(rnd(), 3) * 1.6,
          });
        }
      }
      // after the intro, a resize re-forms the letters in place instead of flying in again
      if (t0 && (performance.now() - t0) / 1000 > FORM_START + FORM_SPAN + 1) next.forEach((s) => ((s.x = s.tx), (s.y = s.ty)));
      stars = next;
    }

    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const sh = copyShift();
      mouse.x = e.clientX - box.left - sh.x;
      mouse.y = e.clientY - box.top - sh.y;
      mouse.on = true;
    };
    const onLeave = () => (mouse.on = false);
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);

    const draw = (now: number) => {
      if (!t0) t0 = now;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      const t = (now - t0) / 1000;
      const dive = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight * 0.6)));
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const settled = Math.min(1, Math.max(0, (t - FORM_START - FORM_SPAN - 0.8) / 1.2)); // 0 while flying, 1 once the type is in
      const follow = copyShift();
      ctx.translate(follow.x, follow.y);
      for (const s of stars) {
        const k = Math.min(1, Math.max(0, (t - FORM_START - s.delay) / FORM_SPAN));
        let alpha: number;
        if (k < 1) {
          // flight: a quadratic curve from the birth point to the letter, easing out
          const e = 1 - Math.pow(1 - k, 3);
          const a = (1 - e) * (1 - e), b = 2 * (1 - e) * e, c = e * e;
          s.x = a * s.sx + b * s.cx + c * s.tx;
          s.y = a * s.sy + b * s.cy + c * s.ty;
          alpha = k <= 0 ? 0 : 0.35 + 0.65 * Math.sin(k * Math.PI * 0.5);
        } else {
          // home: a spring to the letter, pushed away by the pointer, broken apart by the dive
          let hx = s.tx, hy = s.ty;
          if (dive > 0) {
            const ox = s.tx - w * 0.35, oy = s.ty - h * 0.4;
            hx += ox * dive * 0.9 + Math.sin(s.tw * 3) * 120 * dive;
            hy += oy * dive * 0.9 - 160 * dive * (0.5 + Math.cos(s.tw) * 0.5);
          }
          if (mouse.on) {
            const dx = s.x - mouse.x, dy = s.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 9000) {
              const f = (1 - d2 / 9000) * 900;
              const d = Math.sqrt(d2) || 1;
              s.vx += (dx / d) * f * dt;
              s.vy += (dy / d) * f * dt;
            }
          }
          s.vx += (hx - s.x) * 60 * dt;
          s.vy += (hy - s.y) * 60 * dt;
          s.vx *= Math.exp(-dt * 9);
          s.vy *= Math.exp(-dt * 9);
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const away = Math.min(1, Math.hypot(s.x - hx, s.y - hy) / 30);
          const twinkle = 0.5 + 0.5 * Math.sin(t * 2.2 + s.tw);
          // once the type is in, the stars rest faint on it and twinkle; displaced ones glow
          alpha = (1 - settled) * 1 + settled * (0.1 + 0.32 * twinkle) + away * 0.6;
        }
        if (k >= 1) alpha *= follow.o;
        if (alpha <= 0.01) continue;
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha).toFixed(3)})`;
        const r = s.size * (k < 1 ? 1.15 : 1);
        ctx.fillRect(s.x - r / 2, s.y - r / 2, r, r);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.translate(-follow.x, -follow.y);
      if (visible) raf = requestAnimationFrame(draw);
    };

    let ro: ResizeObserver | null = null;
    const start = () => {
      sample();
      raf = requestAnimationFrame(draw);
      ro = new ResizeObserver(() => sample());
      ro.observe(hero);
    };
    // wait for the fonts and for the galaxy to publish its birth point
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    let cancelled = false;
    fontsReady.then(() => requestAnimationFrame(() => !cancelled && start()));

    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      cancelAnimationFrame(raf);
      last = 0;
      if (visible && stars.length) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="star-title" aria-hidden="true" />;
}
