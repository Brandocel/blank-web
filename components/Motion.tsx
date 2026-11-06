"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** All page choreography: smooth scroll, the hero entrance, split-line titles, pinned chapters and scrubbed reveals. */
export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      root.classList.remove("js");
      return;
    }
    // motion has started: cancel the CSS fallback that would otherwise reveal everything after 4 s
    root.classList.add("motion-ready");

    // ── smooth scroll ──
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const id = a.getAttribute("href")!.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target && id !== "top") return;
      e.preventDefault();
      lenis.scrollTo(id === "top" ? 0 : (target as HTMLElement), { offset: id === "top" ? 0 : -72, duration: 1.6 });
      if (location.hash !== `#${id}`) {
        history.pushState(null, "", `#${id}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    };
    document.addEventListener("click", onAnchor);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── hero entrance ──
      const heroTitle = document.querySelector<HTMLElement>('[data-hero="title"]');
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (heroTitle) {
        // the stars build the letters first (StarTitle); the type then condenses out of them
        intro.fromTo(heroTitle, { autoAlpha: 0, filter: "blur(14px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 1.6, ease: "power2.out", clearProps: "filter" }, 2.95);
      }
      // the big bang: one point flashes, the galaxy bursts out of it (Galaxy.tsx), then the instrument settles at its heart
      intro
        .fromTo(".hero__flash", { autoAlpha: 0, scale: 0.04 }, { autoAlpha: 1, scale: 0.3, duration: 0.45, ease: "power4.out" }, 0)
        .to(".hero__flash", { autoAlpha: 0, scale: 1.2, duration: 2.4, ease: "power2.out" }, 0.45)
        .from(".hero__scroll", { autoAlpha: 0, duration: 1 }, 5.2);

      // the eyebrow: the point lights, its line draws, the words decode out of signal
      const eyebrowText = document.querySelector<HTMLElement>(".hero__eyebrow-text");
      intro
        .fromTo(".hero__dot", { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: "back.out(3)" }, 0.9)
        .fromTo(".hero__eyebrow-line", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 1.1);
      if (eyebrowText) {
        // read the words from the label, not the node: in development the effect can run twice on a half-decoded node
        const final = (eyebrowText.parentElement?.getAttribute("aria-label") ?? eyebrowText.textContent ?? "").toUpperCase();
        const glyphs = "·:/\\_+<>01░▒";
        const state = { p: 0 };
        eyebrowText.textContent = final.replace(/\S/g, " ");
        intro.to(
          state,
          {
            p: 1,
            duration: 1.6,
            ease: "none",
            onUpdate: () => {
              const shown = Math.floor(state.p * final.length);
              eyebrowText.textContent = [...final]
                .map((c, i) => (c === " " || i < shown ? c : i < shown + 6 ? glyphs[Math.floor(Math.random() * glyphs.length)] : " "))
                .join("");
            },
            onComplete: () => void (eyebrowText.textContent = final),
          },
          1.5,
        );
      }

      // the lead comes into focus word by word, like a lens; the buttons simply appear, in place
      const lead = document.querySelector<HTMLElement>('[data-hero="lead"]');
      if (lead) {
        const words = SplitText.create(lead, { type: "words", wordsClass: "word" }).words;
        intro.fromTo(words, { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.045, ease: "power2.out" }, 3.7);
      }
      intro.fromTo('[data-hero="actions"] > *', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.12, ease: "expo.out", clearProps: "transform" }, 4.4);
      gsap.set('[data-hero]:not([data-hero="title"])', { autoAlpha: 1 });

      // the dive: the camera falls into the core (Galaxy reads scroll), the instrument rises to meet it
      gsap.to(".planets", {
        autoAlpha: 0,
        ease: "power1.in",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero__copy", {
        y: -120,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "20% top", end: "80% top", scrub: true },
      });

      // ── split-line titles ──
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { autoAlpha: 1 });
            return gsap.from(self.lines, {
              yPercent: 115,
              duration: 1.4,
              ease: "expo.out",
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
          },
        });
      });

      // ── simple reveals ──
      ScrollTrigger.batch("[data-fade]", {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }),
      });
      ScrollTrigger.batch("[data-rise]", {
        start: "top 88%",
        once: true,
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, scale: 1, duration: 1.8, ease: "expo.out" }),
      });
      ScrollTrigger.batch(".case, .post", {
        start: "top 90%",
        once: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: "power2.out", stagger: 0.12 }),
      });

      // ── manifesto: four acts read word by word while the page holds still ──
      const acts = gsap.utils.toArray<HTMLElement>(".manifesto__text");
      if (acts.length) {
        const splits = acts.map((a) => SplitText.create(a, { type: "words", wordsClass: "word" }));
        const now = document.querySelector<HTMLElement>(".manifesto__now");
        const section = document.querySelector<HTMLElement>(".manifesto");
        const steps = gsap.utils.toArray<HTMLElement>(".manifesto__steps > span");
        const stages = gsap.utils.toArray<HTMLElement>(".evo__stages li");
        const evo = document.querySelector<HTMLElement>(".evo");
        // the spark: one number drives the fill, the spark and which stages are lit
        const spark = { p: 0 };
        const paintEvo = () => {
          evo?.style.setProperty("--progress", spark.p.toFixed(4));
          stages.forEach((li, i) => li.classList.toggle("is-on", spark.p >= i / 3 - 0.001));
        };
        paintEvo();
        const actName = document.querySelector<HTMLElement>(".manifesto__act");
        const ring = (k: number) => (k === 0 ? ".ms-point" : `.ms-ring--${k}`);

        mm.add("(min-width: 900px)", () => {
          gsap.set(acts.slice(1), { autoAlpha: 0 });
          gsap.set([".ms-point", ".ms-ring"], { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
          const tl = gsap.timeline({ defaults: { ease: "none" } });
          const marks: number[] = [];
          acts.forEach((act, i) => {
            if (i > 0) tl.fromTo(act, { autoAlpha: 0, yPercent: 14, filter: "blur(6px)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" });
            marks.push(tl.duration());
            tl.fromTo(ring(i), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "power2.out" }, "<");
            tl.fromTo(
              splits[i]!.words,
              { opacity: 0.1, filter: "blur(7px)", y: "0.16em" },
              { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.3, stagger: 0.075, ease: "power2.out" },
              "<",
            );
            tl.to({}, { duration: 0.45 });
            if (i < acts.length - 1) tl.to(act, { autoAlpha: 0, yPercent: -14, filter: "blur(6px)", duration: 0.35, ease: "power2.in" });
          });
          // the story lands: agency, platform, infrastructure, legacy
          tl.fromTo(spark, { p: 0 }, { p: 1, duration: 1.6, ease: "power1.inOut", onUpdate: paintEvo });
          tl.to({}, { duration: 0.4 });

          let shown = -1;
          ScrollTrigger.create({
            trigger: ".manifesto",
            start: "top top",
            end: "+=560%",
            pin: ".manifesto__pin",
            scrub: 0.7,
            animation: tl,
            onUpdate: () => {
              const t = tl.time();
              let k = 0;
              marks.forEach((m, i) => (t >= m - 0.05 ? (k = i) : 0));
              // each act fills its own segment of the rail
              steps.forEach((st, i) => {
                const from = marks[i] ?? 0;
                const to = marks[i + 1] ?? tl.duration();
                st.style.setProperty("--fill", Math.min(1, Math.max(0, (t - from) / (to - from))).toFixed(3));
              });
              if (k !== shown) {
                shown = k;
                if (now) now.textContent = String(k + 1).padStart(2, "0");
                if (actName) actName.textContent = acts[k]!.dataset.k ?? "";
                section?.classList.toggle("is-final", k === acts.length - 1);
              }
            },
          });
        });

        mm.add("(max-width: 899px)", () => {
          splits.forEach((sp, i) => {
            gsap.fromTo(sp.words, { opacity: 0.12, filter: "blur(5px)" }, { opacity: 1, filter: "blur(0px)", stagger: 0.05, ease: "none", scrollTrigger: { trigger: acts[i], start: "top 85%", end: "bottom 50%", scrub: true } });
          });
          gsap.fromTo(spark, { p: 0 }, { p: 1, ease: "none", onUpdate: paintEvo, scrollTrigger: { trigger: ".evo", start: "top 85%", end: "bottom 55%", scrub: true } });
          section?.classList.add("is-final");
        });
      }

      // ── section art drifts at its own pace ──
      gsap.utils.toArray<HTMLElement>(".art").forEach((el) => {
        gsap.fromTo(el, { yPercent: -6 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo(".crescent__body", { rotate: -18 }, { rotate: 8, ease: "none", scrollTrigger: { trigger: "#productos", start: "top bottom", end: "bottom top", scrub: true } });
      gsap.fromTo(".beam__light", { xPercent: -14, opacity: 0.4 }, { xPercent: 6, opacity: 1, ease: "none", scrollTrigger: { trigger: "#casos", start: "top bottom", end: "center center", scrub: true } });

      // ── layers come apart as you read "Cómo se conecta" ──
      const layersSvg = document.querySelector<SVGSVGElement>(".layers__svg");
      if (layersSvg) {
        const [ezx, ezy] = (layersSvg.dataset.ez || "0,0").split(",").map(Number);
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".connect", start: "top 80%", end: "bottom 35%", scrub: 0.8 } });
        layersSvg.querySelectorAll<SVGGElement>("[data-layer]").forEach((g) => {
          const dz = Number(g.dataset.dz || 0);
          tl.fromTo(g, { x: 0, y: 0 }, { x: ezx! * dz, y: ezy! * dz, ease: "none" }, 0);
        });
      }

      // ── capabilities: words slide into place ──
      gsap.utils.toArray<HTMLElement>(".caps__item").forEach((el) => {
        const dir = el.dataset.cap === "r" ? 1 : -1;
        gsap.fromTo(
          el.querySelector(".caps__word"),
          { xPercent: 18 * dir, opacity: 0.08 },
          { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 55%", scrub: 0.8 } },
        );
        gsap.fromTo(el.querySelector(".caps__sub"), { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: el, start: "top 65%", end: "top 50%", scrub: true } });
      });

      // ── process: horizontal journey ──
      mm.add("(min-width: 900px)", () => {
        const track = document.querySelector<HTMLElement>(".hscroll__track");
        if (!track) return;
        const distance = () => track.scrollWidth - window.innerWidth + 64;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: ".hscroll", start: "top top", end: () => `+=${distance()}`, scrub: 0.8, pin: ".hscroll__pin", invalidateOnRefresh: true },
        });
        gsap.fromTo(".hscroll__bar span", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".hscroll", start: "top top", end: () => `+=${distance()}`, scrub: true } });
      });

      // ── statement ──
      gsap.fromTo(
        "[data-scale]",
        { scale: 0.86, opacity: 0.12 },
        { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".statement", start: "top 85%", end: "center 55%", scrub: true } },
      );

      // ── nav hides on the way down ──
      const nav = document.querySelector(".nav");
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => nav?.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 240 && !nav.classList.contains("is-open")),
      });
    });

    // ── cards: a light follows the pointer across each card ──
    const onCardMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".post, .case, .sgrid__item, .plist__row");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onCardMove, { passive: true });

    // buttons stay where they are: no magnet; their hover is light, not movement (globals.css)
    const cleanups: (() => void)[] = [];

    // Jump to a hash on first load (e.g. /#demo) once everything is laid out.
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) requestAnimationFrame(() => lenis.scrollTo(target, { offset: -72, immediate: true }));
    }
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);

    return () => {
      document.removeEventListener("click", onAnchor);
      document.removeEventListener("pointermove", onCardMove);
      cleanups.forEach((c) => c());
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
