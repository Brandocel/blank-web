"use client";

import { contact } from "@/lib/juanras/copy";
import { Chips, Done, Field, Trap, useLeadForm } from "./Form";
import { useSite } from "./Site";

export default function Booking() {
  const { t } = useSite();
  const f = t.book.fields;
  const { status, error, onSubmit, onChange, reset } = useLeadForm("booking");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="jr-book jr-dark" id="contratar">
      <div className="jr-wrap jr-form-grid">
        <div className="jr-form-grid__side">
          <h2 className="jr-h jr-h--b">{t.book.title}</h2>
          <p className="jr-form-grid__lead">{t.book.lead}</p>
          <div className="jr-direct">
            <p>{t.book.talk}</p>
            <a className="jr-link" href={contact.whatsapp} target="_blank" rel="noreferrer">{t.book.whatsapp}</a>
            <a className="jr-link" href={contact.phoneHref}>{contact.phone}</a>
            <a className="jr-link" href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        </div>

        {status === "done" ? (
          <Done title={t.book.doneTitle} text={t.book.doneText} again={t.book.again} onAgain={reset} />
        ) : (
          <form className="jr-form" onSubmit={onSubmit} onChange={onChange} noValidate>
            <Chips name="type" label={f.type} options={t.book.types} error={error} />
            <Field id="bk-date" name="date" label={f.date} type="date" min={today} error={error} />
            <Field id="bk-venue" name="venue" label={f.venue} error={error} />
            <Field id="bk-guests" name="guests" label={f.guests} inputMode="numeric" optional={t.book.optional} error={error} />
            <Field id="bk-name" name="name" label={f.name} autoComplete="name" error={error} />
            <Field id="bk-email" name="email" label={f.email} type="email" inputMode="email" autoComplete="email" error={error} />
            <Field id="bk-wa" name="whatsapp" label={f.whatsapp} type="tel" inputMode="tel" autoComplete="tel" optional={t.book.optional} error={error} />
            <Chips name="needs" label={f.needs} options={t.book.needs} multi optional={t.book.optional} error={error} />
            <Field id="bk-msg" name="message" label={f.message} area wide optional={t.book.optional} error={error} />
            <Trap />
            <div className="jr-form__end">
              <button type="submit" className="jr-btn jr-btn--big" disabled={status === "sending"}>
                {status === "sending" ? t.book.sending : t.book.submit}
              </button>
              {error && !error.field && <p className="jr-field__error" role="alert">{error.message}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
