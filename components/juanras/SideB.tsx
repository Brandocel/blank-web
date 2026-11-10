"use client";

import { useRef, useState } from "react";
import { media } from "@/lib/juanras/copy";
import { useSite } from "./Site";

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
        <h3 className="jr-gallery__title jr-wrap">{t.sideB.galleryTitle}</h3>
        <div className="jr-gallery__track" tabIndex={0} role="group" aria-label={t.sideB.galleryTitle}>
          {media.gallery.map((src, i) => (
            <figure key={src} className="jr-gallery__item">
              <img src={src} alt={t.sideB.galleryAlt[i]} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
