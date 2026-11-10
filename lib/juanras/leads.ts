export const LEAD_TYPES = ["booking", "musician"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];
export type Lead = { type: LeadType; lang: "es" | "en"; fields: Record<string, string> };

/** In the order the fields appear, so the first problem reported is the first one on screen. */
export const REQUIRED: Record<LeadType, string[]> = {
  booking: ["type", "date", "venue", "name", "email"],
  musician: ["instrument", "years", "link", "name", "city", "whatsapp", "email", "consent"],
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LINK_RE = /^https?:\/\/\S+\.\S+/i;

export type Problem = { code: "required" | "email" | "phone" | "link" | "consent"; field: string } | { code: "type" | "long" };

/** First problem found, or null when the lead is valid. Shared by the forms and the API. */
export function checkLead(lead: Lead): Problem | null {
  if (!LEAD_TYPES.includes(lead.type)) return { code: "type" };
  for (const key of REQUIRED[lead.type]) {
    if (!lead.fields[key]?.trim()) return { code: key === "consent" ? "consent" : "required", field: key };
  }
  if (!EMAIL_RE.test(lead.fields.email ?? "")) return { code: "email", field: "email" };
  const phone = lead.fields.whatsapp?.replace(/\D/g, "") ?? "";
  if ((lead.type === "musician" || phone) && phone.length < 10) return { code: "phone", field: "whatsapp" };
  if (lead.type === "musician" && !LINK_RE.test(lead.fields.link ?? "")) return { code: "link", field: "link" };
  for (const v of Object.values(lead.fields)) if (v.length > 4000) return { code: "long" };
  return null;
}

/** Repeated names (checkbox groups) are joined with ", ". */
export function formToFields(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    if (typeof v !== "string") return;
    out[k] = out[k] ? `${out[k]}, ${v.trim()}` : v.trim();
  });
  return out;
}
