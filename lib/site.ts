export const site = {
  name: "BLANK",
  tagline: "The space before intelligence",
  description:
    "BLANK es la plataforma de origen. NØDE es la inteligencia personal. GRID es la inteligencia empresarial. Estrategia, tecnología, marca y comunicación convertidas en activos de largo plazo.",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@blank.mx",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "5210000000000",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "blank.space",
  timezone: "America/Mexico_City",
} as const;

export const nav = [
  { href: "#ecosistema", label: "Ecosistema" },
  { href: "#productos", label: "Productos" },
  { href: "#soluciones", label: "Soluciones" },
  { href: "#casos", label: "Casos" },
  { href: "#insights", label: "Insights" },
] as const;

export function whatsappLink(text = "Hola BLANK, me gustaría platicar sobre un proyecto.") {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length < 10) return `+${d}`;
  const local = d.slice(-10);
  return `+${d.slice(0, d.length - 10)} ${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`;
}
