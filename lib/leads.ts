export const LEAD_TYPES = ["demo", "registro", "mensaje", "newsletter"] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

export type Lead = {
  type: LeadType;
  fields: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIRED: Record<LeadType, string[]> = {
  demo: ["producto", "fecha", "hora", "nombre", "correo"],
  registro: ["plan", "nombre", "correo", "whatsapp", "privacidad"],
  mensaje: ["asunto", "nombre", "correo", "mensaje"],
  newsletter: ["correo"],
};

const LABELS: Record<string, string> = {
  producto: "el producto",
  fecha: "un día",
  hora: "un horario",
  nombre: "tu nombre",
  correo: "tu correo",
  whatsapp: "tu WhatsApp",
  privacidad: "aceptar el aviso de privacidad",
  asunto: "un asunto",
  mensaje: "tu mensaje",
  plan: "un tipo de cuenta",
};

/** Returns a Spanish error message, or null when the lead is valid. Shared by client and API. */
export function validateLead(lead: Lead): string | null {
  if (!LEAD_TYPES.includes(lead.type)) return "Tipo de solicitud no válido.";
  for (const key of REQUIRED[lead.type]) {
    if (!lead.fields[key]?.trim()) {
      const verb = key === "privacidad" ? "Necesitas" : key === "fecha" || key === "hora" ? "Elige" : "Escribe";
      return `${verb} ${LABELS[key] ?? key}.`;
    }
  }
  if (!EMAIL_RE.test(lead.fields.correo ?? "")) return "Revisa tu correo, parece incompleto.";
  if (lead.type === "registro" && lead.fields.whatsapp.replace(/\D/g, "").length < 10)
    return "Tu WhatsApp debe tener al menos 10 dígitos.";
  if (lead.type === "registro" && lead.fields.plan === "grid" && !lead.fields.empresa?.trim())
    return "Escribe el nombre de tu empresa.";
  for (const v of Object.values(lead.fields)) if (v.length > 4000) return "Un campo es demasiado largo.";
  return null;
}

export async function submitLead(lead: Lead): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const err = validateLead(lead);
  if (err) return { ok: false, error: err };
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    const data = (await res.json()) as { ok: boolean; id?: string; error?: string };
    if (!res.ok || !data.ok) return { ok: false, error: data.error ?? "No pudimos enviar tu solicitud." };
    return { ok: true, id: data.id ?? "" };
  } catch {
    return { ok: false, error: "Sin conexión. Intenta de nuevo en un momento." };
  }
}

export function formToFields(form: HTMLFormElement): Record<string, string> {
  const out: Record<string, string> = {};
  new FormData(form).forEach((v, k) => {
    if (typeof v === "string") out[k] = v.trim();
  });
  return out;
}
