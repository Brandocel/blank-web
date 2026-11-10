"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { media } from "@/lib/juanras/copy";
import { useSite } from "./Site";

/** Lado A as the back of a record sleeve: the quiet half of the night, in the order it happens. */
export default function SideA() {
  const { t } = useSite();
  const [active, setActive] = useState(-1);
  const peek = useRef<HTMLDivElement>(null);
  const moveTo = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    const el = peek.current;
    if (!el) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
    moveTo.current = (px, py) => {
      x(px);
      y(py);
    };
    return () => {
      moveTo.current = null;
      gsap.killTweensOf(el);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") moveTo.current?.(e.clientX, e.clientY);
  };

  return (
    <section className="jr-a jr-light" id="lado-a">
      <div className="jr-wrap">
        <header className="jr-a__head">
          <h2 className="jr-a__title">
            {t.sideA.title}
            <span className="jr-script jr-a__kicker">{t.sideA.kicker}</span>
          </h2>
          <p className="jr-a__lead">{t.sideA.lead}</p>
        </header>

        <ol className="jr-tracks" onPointerMove={onMove} onPointerLeave={() => setActive(-1)}>
          {t.sideA.tracks.map((track, i) => (
            <li key={track.code} className="jr-track" onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}>
              <span className="jr-track__code">{track.code}</span>
              <h3 className="jr-track__name">{track.name}</h3>
              <span className="jr-track__format">{track.format}</span>
              <p className="jr-track__text">{track.text}</p>
              <img className="jr-track__thumb jr-bw" src={media.sideA[i]} alt="" loading="lazy" />
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop only: the photo of the row under the cursor, following it. */}
      <div ref={peek} className="jr-peek" aria-hidden="true">
        <div className={`jr-peek__frame ${active >= 0 ? "is-on" : ""}`}>
          {media.sideA.map((src, i) => (
            <img key={src} className={`jr-bw ${i === active ? "is-on" : ""}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
