"use client";

import { media } from "@/lib/juanras/copy";
import { useSite } from "./Site";

export default function Intro() {
  const { t } = useSite();
  return (
    <section className="jr-intro jr-light">
      <div className="jr-wrap jr-intro__grid">
        <p className="jr-intro__statement" data-jr-lines>{t.intro.statement}</p>
        <p className="jr-intro__aside">{t.intro.aside}</p>
      </div>
      <figure className="jr-intro__photo">
        <img className="jr-bw" src={media.intro} alt={t.intro.alt} loading="lazy" />
      </figure>
    </section>
  );
}
