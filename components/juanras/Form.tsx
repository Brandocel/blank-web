"use client";

import { useEffect, useRef, useState } from "react";
import { checkLead, formToFields, type LeadType } from "@/lib/juanras/leads";
import { useSite } from "./Site";

export type FormError = { field?: string; message: string };

/** Validates with the same rules as the API, posts to /api/juanras/lead and reports the problem next to its field. */
export function useLeadForm(type: LeadType) {
  const { t, lang } = useSite();
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<FormError | null>(null);

  const explain = (code: string, field?: string): FormError => {
    const known = t.errors as Record<string, string>;
    return { field, message: known[code] ?? t.errors.generic };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const lead = { type, lang, fields: formToFields(form) };
    const problem = checkLead(lead);
    if (problem) {
      const field = "field" in problem ? problem.field : undefined;
      setError(explain(problem.code, field));
      if (field) form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return;
    }
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/juanras/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
      const data = (await res.json()) as { ok: boolean; code?: string; field?: string };
      if (!res.ok || !data.ok) {
        setStatus("idle");
        setError(explain(data.code ?? "generic", data.field));
        return;
      }
      setStatus("done");
    } catch {
      setStatus("idle");
      setError(explain("network"));
    }
  };

  /** A problem disappears as soon as its field changes. */
  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    if (error && (!error.field || (e.target as HTMLInputElement).name === error.field)) setError(null);
  };

  return { status, error, onSubmit, onChange, reset: () => setStatus("idle") };
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  error: FormError | null;
  type?: string;
  optional?: string;
  hint?: string;
  wide?: boolean;
  area?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url";
  min?: string;
};

export function Field({ id, name, label, error, type = "text", optional, hint, wide, area, autoComplete, inputMode, min }: FieldProps) {
  const bad = error?.field === name;
  const shared = { id, name, autoComplete, "aria-invalid": bad || undefined, "aria-describedby": bad ? `${id}-e` : hint ? `${id}-h` : undefined };
  return (
    <div className={`jr-field ${wide ? "jr-field--wide" : ""} ${bad ? "is-bad" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <em>{optional}</em>}
      </label>
      {area ? <textarea rows={3} {...shared} /> : <input type={type} inputMode={inputMode} min={min} {...shared} />}
      {bad ? <p className="jr-field__error" id={`${id}-e`} role="alert">{error.message}</p> : hint ? <p className="jr-field__hint" id={`${id}-h`}>{hint}</p> : null}
    </div>
  );
}

type ChipsProps = {
  name: string;
  label: string;
  options: string[];
  error: FormError | null;
  multi?: boolean;
  optional?: string;
  onPick?: (value: string) => void;
};

export function Chips({ name, label, options, error, multi, optional, onPick }: ChipsProps) {
  const bad = error?.field === name;
  return (
    <fieldset className={`jr-field jr-field--wide jr-chips ${bad ? "is-bad" : ""}`}>
      <legend>
        {label}
        {optional && <em>{optional}</em>}
      </legend>
      <div className="jr-chips__row">
        {options.map((o) => (
          <label key={o} className="jr-chip">
            <input type={multi ? "checkbox" : "radio"} name={name} value={o} onChange={() => onPick?.(o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
      {bad && <p className="jr-field__error" role="alert">{error.message}</p>}
    </fieldset>
  );
}

/** Honeypot: hidden from people, irresistible to bots. */
export function Trap() {
  return (
    <div className="jr-trap" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Done({ title, text, again, onAgain }: { title: string; text: string; again: string; onAgain: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} className="jr-done" tabIndex={-1} role="status">
      <p className="jr-done__title">{title}</p>
      <p>{text}</p>
      <button type="button" className="jr-link" onClick={onAgain}>{again}</button>
    </div>
  );
}
