"use client";

import { media } from "@/lib/juanras/copy";
import Compare from "./Compare";
import { useSite } from "./Site";

export default function Stage() {
  const { t } = useSite();
  return (
    <section className="jr-stage jr-dark">
      <div className="jr-wrap jr-stage__grid">
        <div className="jr-stage__copy">
          <h2 className="jr-h jr-h--b">{t.stage.title}</h2>
          <p>{t.stage.text}</p>
        </div>
        <Compare
          className="jr-stage__split"
          label={t.stage.slider}
          start={50}
          under={
            <>
              <img src={media.stage.gala} alt={t.stage.altGala} loading="lazy" />
              <span className="jr-stage__tag jr-stage__tag--a">{t.stage.gala}</span>
            </>
          }
          over={
            <>
              <img src={media.stage.party} alt={t.stage.altParty} loading="lazy" />
              <span className="jr-stage__tag jr-stage__tag--b">{t.stage.party}</span>
            </>
          }
        />
      </div>
    </section>
  );
}
