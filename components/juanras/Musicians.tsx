"use client";

import { useState } from "react";
import { media } from "@/lib/juanras/copy";
import { Chips, Done, Field, Trap, useLeadForm } from "./Form";
import { useSite } from "./Site";

/** Musicians apply here. The empty place next to the line-up fills with the instrument they pick. */
export default function Musicians() {
  const { t } = useSite();
  const f = t.join.fields;
  const { status, error, onSubmit, onChange, reset } = useLeadForm("musician");
  const [instrument, setInstrument] = useState("");
  const consentBad = error?.field === "consent";

  return (
    <section className="jr-join jr-light" id="musicos">
      <div className="jr-wrap">
        <h2 className="jr-join__title">{t.join.title}</h2>

        <div className="jr-lineup">
          <img className="jr-bw" src={media.lineup} alt={t.join.alt} loading="lazy" />
          <div className={`jr-slot ${instrument ? "is-set" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 60 150" preserveAspectRatio="xMidYMax meet">
              <circle cx="30" cy="16" r="11" />
              <path d="M8 150 V58 Q8 34 30 34 Q52 34 52 58 V150" />
            </svg>
            <p className="jr-slot__who">{instrument || "?"}</p>
            <p className="jr-script jr-slot__you">{t.join.slot}</p>
          </div>
        </div>

        <div className="jr-form-grid">
          <div className="jr-form-grid__side">
            <p className="jr-form-grid__lead">{t.join.lead}</p>
          </div>

          {status === "done" ? (
            <Done
              title={t.join.doneTitle}
              text={t.join.doneText}
              again={t.join.again}
              onAgain={() => {
                setInstrument("");
                reset();
              }}
            />
          ) : (
            <form className="jr-form" onSubmit={onSubmit} onChange={onChange} noValidate>
              <Chips name="instrument" label={f.instrument} options={t.join.instruments} error={error} onPick={setInstrument} />
              <Field id="ms-other" name="other" label={f.other} optional={t.join.optional} error={error} />
              <Field id="ms-genres" name="genres" label={f.genres} optional={t.join.optional} error={error} />
              <Chips name="years" label={f.years} options={t.join.years} error={error} />
              <Field id="ms-link" name="link" label={f.link} type="url" inputMode="url" hint={t.join.linkHint} wide error={error} />
              <Field id="ms-name" name="name" label={f.name} autoComplete="name" error={error} />
              <Field id="ms-city" name="city" label={f.city} autoComplete="address-level2" error={error} />
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
