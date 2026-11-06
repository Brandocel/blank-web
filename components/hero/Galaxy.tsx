"use client";

import { useEffect, useRef } from "react";
import { PointIcon, SpaceIcon, SystemIcon } from "../Icons";
import Wordmark from "../Wordmark";

/**
 * The hero's universe, in WebGL. Everything starts as one point (the space before anything exists),
 * bursts outward and settles into a slowly turning spiral galaxy, inner stars faster than outer ones.
 * Three orbits of fine stars circle the core, and on them the three bodies of the ecosystem:
 * GRID nearest, NØDE, then BLANK, the outer space. They are HTML, placed every frame with the same
 * camera as the shader, so they sit in the galaxy's plane. Hover slows a body and lights its orbit;
 * click goes to its chapter. The pointer tilts the camera; scrolling dives into the core.
 */

export const BODIES = [
  { name: "GRID", tag: "The system", line: "Inteligencia empresarial", R: 0.62, w: 0.3, a0: 4.2, href: "#grid", Icon: SystemIcon },
  { name: "NØDE", tag: "The point", line: "Inteligencia personal", R: 0.98, w: 0.19, a0: 0.6, href: "#node", Icon: PointIcon },
  { name: "BLANK", tag: "The space", line: "Estrategia y arquitectura", R: 1.26, w: 0.12, a0: 2.3, href: "#ecosistema", Icon: SpaceIcon },
];

const VERT = `
attribute vec4 a_gal;   // r, theta, height, kind (0 disc, 1 halo, 2 core, 3 dust, 4 orbit)
attribute vec4 a_look;  // size, brightness, delay, tint (orbit: its index)
uniform float u_time, u_form, u_dive, u_aspect, u_dpr, u_scale, u_hi, u_lightOn;
uniform vec3 u_light;
uniform vec2 u_mouse, u_center;
varying float v_alpha;
varying float v_tint;
varying float v_soft;

void main() {
  float kind = a_gal.w;
  float r = a_gal.x;
  float spin = kind > 3.5 ? 0.0 : (kind > 0.5 && kind < 1.5 ? u_time * 0.012 : u_time * (0.025 + 0.085 / (r + 0.35)));
  float a = a_gal.y + spin;
  vec3 gp = vec3(cos(a) * r, a_gal.z, sin(a) * r);

  // the hovered body lights the stars around it; the rest of the sky dims a little
  vec3 dl = gp - u_light;
  float glow = u_lightOn * exp(-dot(dl, dl) * 7.0);
  float shade = 1.0 - 0.45 * u_lightOn + glow * 3.2;

  float f = clamp((u_form - a_look.z) / 0.9, 0.0, 1.0);
  f = 1.0 - pow(1.0 - f, 3.0);
  vec3 p = gp * f;
  p.y += (1.0 - f) * sin(a_gal.y * 7.0) * 0.08;

  float yaw = u_mouse.x * 0.22;
  float tilt = 0.78 + u_mouse.y * 0.1 + u_dive * 0.6;
  p = vec3(p.x * cos(yaw) + p.z * sin(yaw), p.y, -p.x * sin(yaw) + p.z * cos(yaw));
  float c = cos(tilt), s = sin(tilt);
  p = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);

  float camZ = 3.0 - u_dive * 2.35;
  float d = camZ - p.z;
  float focal = 1.9 * u_scale;
  vec2 ndc = vec2(p.x / d * focal / u_aspect, p.y / d * focal) + u_center;
  gl_Position = vec4(ndc, 0.0, 1.0);

  float near = smoothstep(0.35, 1.4, d);
  bool orbit = kind > 3.5;
  bool lit = orbit && abs(a_look.w - u_hi) < 0.5;
  float size = a_look.x * (lit ? 1.5 : 1.0) * (1.0 + glow * 0.7);
  float cap = kind > 2.5 && kind < 3.5 ? 90.0 : 10.0;
  gl_PointSize = clamp(size * u_dpr * (4.6 / max(d, 0.3)), 0.0, cap * u_dpr) * near;
  float flash = (1.0 - f) * 1.6;
  float bright = a_look.y * (lit ? 3.2 : 1.0) * shade;
  v_alpha = (bright * (0.25 + 0.75 * f) + flash * 0.05) * near * (orbit ? f : 1.0);
  v_tint = orbit ? 0.35 : a_look.w;
  v_soft = kind > 2.5 && kind < 3.5 ? 1.0 : 0.0;
}`;

const FRAG = `
precision mediump float;
varying float v_alpha;
varying float v_tint;
varying float v_soft;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float star = smoothstep(0.5, 0.0, d);
  star = star * star * (0.6 + 0.4 * star);
  float haze = exp(-d * d * 14.0) * smoothstep(0.5, 0.3, d);
  float k = mix(star, haze, v_soft);
  vec3 col = mix(vec3(0.82, 0.88, 1.0), vec3(1.0, 0.95, 0.88), v_tint);
  gl_FragColor = vec4(col * k * v_alpha, 1.0);
}`;

function build(count: number) {
  const ORBIT_DOTS = [220, 320, 440];
  const total = count + ORBIT_DOTS.reduce((s, n) => s + n, 0);
  const gal = new Float32Array(total * 4);
  const look = new Float32Array(total * 4);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-6))) * Math.cos(2 * Math.PI * rnd());
  const ARMS = 3;
  const R = 1.9;
  const arm = (r: number, spread: number) => (Math.floor(rnd() * ARMS) / ARMS) * Math.PI * 2 + Math.log(r + 0.2) * 2.6 + gauss() * spread;
  let i = 0;
  const put = (g: number[], l: number[]) => {
    gal.set(g, i * 4);
    look.set(l, i * 4);
    i++;
  };
  for (let n = 0; n < count; n++) {
    const k = rnd();
    if (k < 0.06) {
      // dust: wide, very faint haze along the arms and round the bulge
      const bulge = rnd() < 0.35;
      const r = bulge ? Math.abs(gauss()) * 0.3 : 0.2 + Math.pow(rnd(), 0.8) * R * 0.9;
      put([r, bulge ? rnd() * Math.PI * 2 : arm(r, 0.18), gauss() * 0.03, 3], [bulge ? 18 + rnd() * 16 : 10 + rnd() * 16, bulge ? 0.018 + rnd() * 0.014 : 0.008 + rnd() * 0.012, Math.min(r / 2.6, 1) * 0.55 + 0.25, bulge ? 0.95 : 0.3 + rnd() * 0.3]);
    } else if (k < 0.13) {
      const r = Math.abs(gauss()) * 0.16;
      put([r, rnd() * Math.PI * 2, gauss() * 0.05, 2], [1.4 + rnd() * 2.6, 0.55 + rnd() * 0.45, rnd() * 0.12, 0.9]);
    } else if (k < 0.8) {
      const r = 0.12 + Math.pow(rnd(), 0.75) * R;
      put([r, arm(r, 0.14 + 0.16 * (r / R)), gauss() * (0.03 + 0.05 * (1 - r / R)), 0], [0.7 + Math.pow(rnd(), 3) * 3.2, 0.18 + Math.pow(rnd(), 2) * 0.82 * (1.15 - r / R), Math.min(r / 2.6, 1) * 0.55 + rnd() * 0.12, Math.max(0, 1 - r / R) * 0.9]);
    } else {
      const r = 0.5 + rnd() * 2.3;
      put([r, rnd() * Math.PI * 2, gauss() * 0.9, 1], [0.5 + Math.pow(rnd(), 4) * 2.4, 0.1 + Math.pow(rnd(), 3) * 0.75, Math.min(r / 2.6, 1) * 0.55 + rnd() * 0.12, rnd() * 0.4]);
    }
  }
  // the three orbits: fine dotted rings that draw themselves in once the galaxy has formed
  BODIES.forEach((b, o) => {
    const n = ORBIT_DOTS[o]!;
    for (let j = 0; j < n; j++) put([b.R, (j / n) * Math.PI * 2, 0, 4], [1.25, 0.62, 0.95 + (j / n) * 0.6, o]);
  });
  return { gal, look, total };
}

export default function Galaxy() {
  const ref = useRef<HTMLCanvasElement>(null);
  const bodies = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const hero = canvas.parentElement as HTMLElement;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      canvas.dataset.fallback = "";
      return;
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 700px)").matches;
    const wide = () => window.matchMedia("(min-width: 1100px)").matches;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[galaxy] shader:", gl.getProgramInfoLog(prog));
      canvas.dataset.fallback = "";
      return;
    }
    delete canvas.dataset.fallback;
    gl.useProgram(prog);

    const { gal, look, total } = build(small ? 8000 : 16000);
    const buffers: WebGLBuffer[] = [];
    const attr = (name: string, data: Float32Array) => {
      const buf = gl.createBuffer()!;
      buffers.push(buf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    };
    attr("a_gal", gal);
    attr("a_look", look);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { time: U("u_time"), form: U("u_form"), dive: U("u_dive"), aspect: U("u_aspect"), dpr: U("u_dpr"), scale: U("u_scale"), mouse: U("u_mouse"), center: U("u_center"), hi: U("u_hi"), light: U("u_light"), lightOn: U("u_lightOn") };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0.0196, 0.0196, 0.0196, 1);

    let w = 0, h = 0, dpr = 1;
    const center = { x: 0.42, y: -0.08 };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (wide()) Object.assign(center, { x: 0.52, y: -0.08 });
      else Object.assign(center, { x: 0, y: -0.42 });
      hero.style.setProperty("--gx", `${((center.x + 1) / 2) * 100}%`);
      hero.style.setProperty("--gy", `${((1 - center.y) / 2) * 100}%`);
    };
    resize();

    const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -1e4, py: -1e4 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      const box = canvas.getBoundingClientRect();
      mouse.px = e.clientX - box.left;
      mouse.py = e.clientY - box.top;
    };
    const nav = canvas.parentElement!.querySelector<HTMLElement>(".planets");
    const blockers = Array.from(hero.querySelectorAll<HTMLElement>(".hero__title, .hero__lead, .hero__actions"));
    const behindCopy = (x: number, y: number) => {
      const box = canvas.getBoundingClientRect();
      return blockers.some((b) => {
        const r = b.getBoundingClientRect();
        const pad = 26;
        // the title's box is wider than its lines; test against the lines' own boxes when it is split
        const lines = b.querySelectorAll<HTMLElement>(".line");
        const rects = lines.length ? Array.from(lines).map((l) => l.getBoundingClientRect()) : [r];
        return rects.some((q) => x > q.left - box.left - pad && x < q.right - box.left + pad && y > q.top - box.top - pad && y < q.bottom - box.top + pad);
      });
    };
    const glowAt = { x: 0, y: 0, z: 0, on: 0 };
    window.addEventListener("pointermove", onMove, { passive: true });

    // bodies: angle, rate (eases toward 0.15 under the pointer), and which one is lit
    const orbit = BODIES.map((b) => ({ a: b.a0, rate: 1, ox: 0, oy: 0 }));
    let hi = -1;
    const enter = (i: number) => () => (hi = i);
    const leave = () => (hi = -1);
    const offs = bodies.current.map((el, i) => {
      if (!el) return () => {};
      const on = enter(i);
      el.addEventListener("pointerenter", on);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", on);
      el.addEventListener("blur", leave);
      return () => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", leave);
        el.removeEventListener("focus", on);
        el.removeEventListener("blur", leave);
      };
    });

    let raf = 0, visible = true, t0 = 0, last = 0, clock = 0, form = still ? 2.4 : 0;
    const draw = (now: number) => {
      if (!t0) t0 = now;
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      clock += dt;
      if (!still) {
        const k = Math.min(1, (now - t0) / 4200);
        form = 2.4 * (1 - Math.pow(1 - k, 2.2));
      }
      mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-dt * 2.5));
      mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-dt * 2.5));
      const dive = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
      const scale = small ? Math.min(0.58, (w / Math.max(h, 1)) * 1.02) : Math.min(1.15, Math.max(0.8, h / 800));
      const aspect = w / Math.max(h, 1);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.time, still ? 40 : clock + 40);
      gl.uniform1f(u.form, form);
      gl.uniform1f(u.dive, dive);
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.scale, scale);
      gl.uniform1f(u.hi, hi);
      glowAt.on += ((hi >= 0 ? 1 : 0) - glowAt.on) * (1 - Math.exp(-dt * 5));
      if (hi >= 0) {
        const o = orbit[hi]!;
        const R = BODIES[hi]!.R;
        glowAt.x = Math.cos(o.a) * R;
        glowAt.z = Math.sin(o.a) * R;
      }
      gl.uniform3f(u.light, glowAt.x, 0, glowAt.z);
      gl.uniform1f(u.lightOn, glowAt.on);
      nav?.toggleAttribute("data-focus", hi >= 0);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform2f(u.center, center.x, center.y);
      gl.drawArrays(gl.POINTS, 0, total);

      // the same camera, on the CPU, for the three bodies
      const yaw = mouse.x * 0.22;
      const tilt = 0.78 + mouse.y * 0.1 + dive * 0.6;
      const camZ = 3 - dive * 2.35;
      const focal = 1.9 * scale;
      BODIES.forEach((b, i) => {
        const o = orbit[i]!;
        o.rate += ((hi === i ? 0.12 : 1) - o.rate) * (1 - Math.exp(-dt * 4));
        if (!still) o.a += b.w * o.rate * dt * 0.6;
        let x = Math.cos(o.a) * b.R, y = 0, z = Math.sin(o.a) * b.R;
        [x, z] = [x * Math.cos(yaw) + z * Math.sin(yaw), -x * Math.sin(yaw) + z * Math.cos(yaw)];
        [y, z] = [y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)];
        const d = camZ - z;
        const nx = (x / d) * focal / aspect + center.x;
        const ny = (y / d) * focal + center.y;
        const el = bodies.current[i];
        if (!el) return;
        const sx = ((nx + 1) / 2) * w;
        const sy = ((1 - ny) / 2) * h;
        // each body appears once the galaxy has formed, the inner one first
        const born = Math.min(1, Math.max(0, (form - 1.5 - i * 0.18) / 0.5));
        const grow = 1 - Math.pow(1 - born, 3);
        // the hovered body leans toward the pointer, like a magnet, and settles back when let go
        const pull = hi === i ? 0.32 : 0;
        const tx = Math.max(-28, Math.min(28, (mouse.px - sx) * pull));
        const ty = Math.max(-28, Math.min(28, (mouse.py - sy) * pull));
        o.ox += (tx - o.ox) * (1 - Math.exp(-dt * 8));
        o.oy += (ty - o.oy) * (1 - Math.exp(-dt * 8));
        const s = Math.min(1.35, Math.max(0.7, 3 / d)) * (0.4 + 0.6 * grow) * (hi === i ? 1.18 : 1);
        el.style.opacity = born >= 1 ? "" : grow.toFixed(3);
        el.style.visibility = born > 0 ? "" : "hidden";
        el.style.transform = `translate3d(${(sx + o.ox).toFixed(1)}px, ${(sy + o.oy).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        el.style.zIndex = String(Math.round(100 - d * 10));
        el.toggleAttribute("data-far", z < -0.2);
        el.toggleAttribute("data-eclipsed", hi !== i && behindCopy(sx, sy));
        el.toggleAttribute("data-lit", hi === i);
      });

      if (visible && !still) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      cancelAnimationFrame(raf);
      last = 0;
      if (visible) raf = requestAnimationFrame(draw);
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw(performance.now());
    });
    ro.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      offs.forEach((off) => off());
      window.removeEventListener("pointermove", onMove);
      // keep the context: React may mount this effect again on the same canvas
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <>
      <canvas ref={ref} className="galaxy" aria-hidden="true" />
      <div className="hero__flash" aria-hidden="true" />
      <nav className="planets" aria-label="Ecosistema BLANK">
        {BODIES.map(({ name, tag, line, href, Icon }, i) => (
          <a
            key={name}
            ref={(el) => {
              bodies.current[i] = el;
            }}
            href={href}
            className="planet"
            data-planet={i}
          >
            <span className="planet__orb">
              <Icon />
            </span>
            <span className="planet__label">
              <Wordmark name={name} className="planet__name" />
              <small>{tag}</small>
              <em className="planet__line">{line}</em>
            </span>
          </a>
        ))}
      </nav>
    </>
  );
}
