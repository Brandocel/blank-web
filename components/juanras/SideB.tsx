"use client";

import { useRef, useState } from "react";
import { media } from "@/lib/juanras/copy";
import { useSite } from "./Site";

/** The strip's rhythm: full frames, then a smaller one hung high or low with its caption on the open side. */
const SHAPES = ["wide", "tall-low", "small-high", "tall", "wide-low", "wide", "small-high"] as const;

export default function SideB() {
  const { t } = useSite();
  const video = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = sound;
    if (!sound) v.play().catch(() => {});
    setSound(!sound);
  };

  const genres = t.sideB.genres;

  // Narrow screens swipe the strip natively; wide ones are driven by the page scroll (see Motion).
  const onStripScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    el.parentElement?.style.setProperty("--p", max > 0 ? (el.scrollLeft / max).toFixed(3) : "0");
  };

  return (
    <section className="jr-b jr-dark">
      <div className="jr-wrap jr-b__top">
        <h3 className="jr-b__title">{t.sideB.title}</h3>
        <p className="jr-b__lead">{t.sideB.lead}</p>
      </div>

      <div className="jr-b__film">
        <video ref={video} src={media.video.party} poster={media.poster.party} muted loop playsInline autoPlay preload="metadata" />
        <button type="button" className="jr-sound" onClick={toggleSound} aria-pressed={sound}>
          <span className={`jr-sound__bars ${sound ? "is-on" : ""}`} aria-hidden="true"><i /><i /><i /><i /></span>
          {sound ? t.sideB.soundOff : t.sideB.soundOn}
        </button>
      </div>

      <ul className="jr-sr">
        {genres.map((g) => <li key={g}>{g}</li>)}
      </ul>
      <div className="jr-marquee" aria-hidden="true">
        <div className="jr-marquee__track">
          {[0, 1].map((n) => (
            <p key={n}>
              {genres.map((g) => <span key={g}>{g}</span>)}
            </p>
          ))}
        </div>
      </div>

      <div className="jr-gallery">
        <div className="jr-gallery__head">
          <h3 className="jr-gallery__title">{t.sideB.galleryTitle}</h3>
          {/* how far along the strip you are */}
          <div className="jr-gallery__bar" aria-hidden="true"><i /></div>
        </div>
        <div className="jr-gallery__track" tabIndex={0} role="group" aria-label={t.sideB.galleryTitle} onScroll={onStripScroll}>
          {media.gallery.map((src, i) => (
            <figure key={src} className={`jr-shot jr-shot--${SHAPES[i % SHAPES.length]}`}>
              <div className="jr-shot__frame">
                <img src={src} alt={t.sideB.galleryAlt[i]} loading="lazy" />
              </div>
              <figcaption>{t.sideB.galleryCaptions[i]}</figcaption>
            </figure>
          ))}
          <div className="jr-gallery__end">
            <p>{t.sideB.galleryEnd}</p>
            <a href="#contratar" className="jr-btn jr-btn--big">{t.nav.book}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
