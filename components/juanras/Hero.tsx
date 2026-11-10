"use client";

import { useEffect, useRef } from "react";
import { media } from "@/lib/juanras/copy";
import Compare from "./Compare";
import { useSite } from "./Site";

/**
 * The whole pitch in one frame: the suit side and the party side, with the divider in the visitor's hand.
 * Both clips end on the band's own wordmark, so at rest the logo itself is half gold, half neon.
 */
export default function Hero() {
  const { t } = useSite();
  const a = useRef<HTMLVideoElement>(null);
  const b = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const va = a.current;
    const vb = b.current;
    if (!va || !vb) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // back to the posters: the last frame of each clip
      [va, vb].forEach((v) => {
        v.autoplay = false;
        v.load();
      });
      return;
    }
    // Each clip plays once and holds on the wordmark; a while later both start over, in step.
    let timer = 0;
    const again = () => {
      timer = window.setTimeout(() => {
        [va, vb].forEach((v) => {
          v.currentTime = 0;
          v.play().catch(() => {});
        });
      }, 7000);
    };
    va.addEventListener("ended", again);
    return () => {
      window.clearTimeout(timer);
      va.removeEventListener("ended", again);
    };
  }, []);

  return (
    <section className="jr-hero" id="top">
      <h1 className="jr-sr">{t.hero.h1}</h1>
      <Compare
        className="jr-hero__split"
        label={t.hero.slider}
        start={50}
        from={100}
        follow
        under={
          <div className="jr-hero__side jr-hero__side--a">
            <video ref={a} className="jr-bw" src={media.video.a} poster={media.poster.a} muted playsInline autoPlay preload="auto" />
            <p className="jr-hero__line" aria-hidden="true">
              <span>{t.hero.a[0]}</span>
              <span>{t.hero.a[1]}</span>
            </p>
          </div>
        }
        over={
          <div className="jr-hero__side jr-hero__side--b">
            <video ref={b} src={media.video.b} poster={media.poster.b} muted playsInline autoPlay preload="auto" />
            <p className="jr-hero__line" aria-hidden="true">
              <span>{t.hero.b[0]}</span>
              <span>{t.hero.b[1]}</span>
            </p>
          </div>
        }
      />
      <div className="jr-hero__foot">
        <p>{t.hero.sub}</p>
        <a href="#contratar" className="jr-btn jr-btn--white">{t.hero.cta}</a>
      </div>
    </section>
  );
}
