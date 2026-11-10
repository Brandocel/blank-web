"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Scroll choreography. One big moment (the record flips and the page changes side) and three small ones:
 * the statement rises line by line, the photo settles, the gallery travels sideways.
 * Without this component, or with reduced motion, every section still reads in its final state.
 */
export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".jr");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("jr--motion");

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 }, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const mm = gsap.matchMedia(root);

    mm.add("all", () => {
      // The statement rises line by line, once.
      gsap.utils.toArray<HTMLElement>("[data-jr-lines]").forEach((el) => {
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 82%", once: true } });
          },
        });
      });

      gsap.fromTo(".jr-intro__photo img", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".jr-intro__photo", start: "top bottom", end: "bottom top", scrub: true } });

      // ── The flip ──
      // Lado A's last frame: the record comes up, turns over, and Lado B spreads from its centre.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".jr-flip", start: "top top", end: "+=240%", pin: true, scrub: 0.6, anticipatePin: 1 },
      });
      tl.fromTo(".jr-record__lift", { yPercent: 95, scale: 0.72 }, { yPercent: 0, scale: 1, duration: 1, ease: "power2.out" }, 0)
        .fromTo(".jr-flip__cue", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.55)
        .to(".jr-flip__cue", { autoAlpha: 0, duration: 0.25 }, 1.25)
        .fromTo(".jr-record__turn", { rotateY: 0 }, { rotateY: 180, duration: 1, ease: "power2.inOut" }, 1.2)
        .fromTo(".jr-flip__night", { clipPath: "circle(0% at 50% 60%)" }, { clipPath: "circle(120% at 50% 60%)", duration: 1.1, ease: "power2.in" }, 1.45)
        .fromTo(".jr-flip__word", { "--jr-w": 50 }, { "--jr-w": 150, duration: 1.1, ease: "power2.inOut" }, 1.45)
        .to(".jr-record__lift", { yPercent: 62, scale: 1.3, duration: 0.9, ease: "power2.inOut" }, 2.6);
    });

    // Wide screens: the gallery pins and travels sideways. Narrow ones keep the native swipe.
    mm.add("(min-width: 900px)", () => {
      const gallery = root.querySelector<HTMLElement>(".jr-gallery");
      const track = root.querySelector<HTMLElement>(".jr-gallery__track");
      if (!gallery || !track) return;
      const travel = () => Math.max(0, track.scrollWidth - gallery.clientWidth);
      const strip = gsap.to(track, {
        x: () => -travel(),
        ease: "none",
        scrollTrigger: {
          trigger: gallery,
          start: "top top",
          end: () => `+=${travel()}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => gallery.style.setProperty("--p", self.progress.toFixed(3)),
        },
      });
      // Each photo drifts a little inside its frame as it crosses the screen.
      gsap.utils.toArray<HTMLElement>(".jr-shot__frame").forEach((frame) => {
        gsap.fromTo(frame.querySelector("img"), { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: frame, containerAnimation: strip, start: "left right", end: "right left", scrub: true } });
      });
      return () => gallery.style.removeProperty("--p");
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      root.classList.remove("jr--motion");
    };
  }, []);

  return null;
}
