"use client";

import { useState } from "react";
import { media } from "@/lib/juanras/copy";
import { Chips, Done, Field, Trap, useLeadForm } from "./Form";
import { useSite } from "./Site";

type Me = { name: string; instrument: string; years: string; link: boolean };
const NOBODY: Me = { name: "", instrument: "", years: "", link: false };

/**
 * The eighth member, built as the form is filled: the name gives them a head and a signature,
 * the instrument a suit, the years on stage a tie, and the video the band's sunglasses.
 */
function Slot({ me, fallback, card }: { me: Me; fallback: string; card?: boolean }) {
  const first = me.name.trim().split(/\s+/)[0]?.slice(0, 14) ?? "";
  const shown = first || fallback;
  const state = [first && "has-name", me.instrument && "has-suit", me.years && "has-tie", me.link && "has-shades"].filter(Boolean).join(" ");
  return (
    <div className={`jr-slot ${card ? "jr-slot--card" : ""} ${state}`} aria-hidden="true" style={{ "--n": Math.max(4, shown.length) } as React.CSSProperties}>
      <svg viewBox="0 0 100 150" preserveAspectRatio="xMidYMax meet">
        <path className="jr-slot__suit" d="M10 150 V86 Q10 50 50 50 Q90 50 90 86 V150" />
        <path className="jr-slot__shirt" d="M38 51.6 L50 92 L62 51.6 Q50 48.8 38 51.6 Z" />
        <path className="jr-slot__tie" d="M47.6 54 h4.8 l2.6 28 -5 8 -5 -8 Z" />
        <circle className="jr-slot__head" cx="50" cy="24" r="18" />
        <path className="jr-slot__shades" d="M33.5 18.6 h14 v4.8 q-7 5.8 -14 0 Z M52.5 18.6 h14 v4.8 q-7 5.8 -14 0 Z M47 19.2 h6 v2.2 h-6 Z" />
      </svg>
      <p className="jr-slot__who">{me.instrument || "?"}</p>
      <p className="jr-script jr-slot__you">{shown}</p>
    </div>
  );
}

/** Musicians apply here. The empty place next to the line-up turns into them as they fill the form. */
export default function Musicians() {
  const { t } = useSite();
  const f = t.join.fields;
  const { status, error, onSubmit, onChange, reset } = useLeadForm("musician");
  const [me, setMe] = useState<Me>(NOBODY);
  const consentBad = error?.field === "consent";

  const onFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    onChange(e);
    const el = e.target as HTMLInputElement;
    if (el.name === "name") setMe((m) => ({ ...m, name: el.value }));
    else if (el.name === "instrument") setMe((m) => ({ ...m, instrument: el.value }));
    else if (el.name === "years") setMe((m) => ({ ...m, years: el.value }));
    else if (el.name === "link") setMe((m) => ({ ...m, link: el.value.trim().length > 7 }));
  };

  return (
    <section className="jr-join jr-light" id="musicos">
      <div className="jr-wrap">
        <h2 className="jr-join__title">{t.join.title}</h2>

        <div className="jr-lineup">
          <img className="jr-bw" src={media.lineup} alt={t.join.alt} loading="lazy" />
          <Slot me={me} fallback={t.join.slot} />
        </div>

        <div className="jr-form-grid">
          <div className="jr-form-grid__side">
            <p className="jr-form-grid__lead">{t.join.lead}</p>
            {/* the same figure, kept in view while the form scrolls */}
            <Slot me={me} fallback={t.join.slot} card />
          </div>

          {status === "done" ? (
            <Done
              title={t.join.doneTitle}
              text={t.join.doneText}
              again={t.join.again}
              onAgain={() => {
                setMe(NOBODY);
                reset();
              }}
            />
          ) : (
            <form className="jr-form" onSubmit={onSubmit} onChange={onFormChange} noValidate>
              <Field id="ms-name" name="name" label={f.name} autoComplete="name" wide error={error} />
              <Chips name="instrument" label={f.instrument} options={t.join.instruments} error={error} />
              <Chips name="years" label={f.years} options={t.join.years} error={error} />
              <Field id="ms-link" name="link" label={f.link} type="url" inputMode="url" hint={t.join.linkHint} wide error={error} />
              <Field id="ms-other" name="other" label={f.other} optional={t.join.optional} error={error} />
              <Field id="ms-genres" name="genres" label={f.genres} optional={t.join.optional} error={error} />
              <Field id="ms-city" name="city" label={f.city} autoComplete="address-level2" wide error={error} />
              <Field id="ms-wa" name="whatsapp" label={f.whatsapp} type="tel" inputMode="tel" autoComplete="tel" error={error} />
              <Field id="ms-email" name="email" label={f.email} type="email" inputMode="email" autoComplete="email" error={error} />
              <Chips name="travel" label={f.travel} options={t.join.travel} optional={t.join.optional} error={error} />
              <Field id="ms-about" name="about" label={f.about} area wide optional={t.join.optional} error={error} />
              <Trap />
              <div className={`jr-field jr-field--wide jr-consent ${consentBad ? "is-bad" : ""}`}>
                <label>
                  <input type="checkbox" name="consent" value="yes" aria-invalid={consentBad || undefined} />
                  <span>{f.consent}</span>
                </label>
                {consentBad && <p className="jr-field__error" role="alert">{error.message}</p>}
              </div>
              <div className="jr-form__end">
                <button type="submit" className="jr-btn jr-btn--big" disabled={status === "sending"}>
                  {status === "sending" ? t.join.sending : t.join.submit}
                </button>
                {error && !error.field && <p className="jr-field__error" role="alert">{error.message}</p>}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
