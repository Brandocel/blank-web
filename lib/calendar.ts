/** Demo slots, in Mexico City time (UTC-6, no DST since 2022). */
export const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "16:00", "17:00"] as const;
const CDMX_OFFSET_H = 6;

const pad = (n: number) => String(n).padStart(2, "0");

export const isoDate = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function cdmxNow() {
  const t = new Date(Date.now() - CDMX_OFFSET_H * 3600_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes() };
}

export function dayLabel(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

const stamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

/** Builds a minimal iCalendar event (45 min) for the chosen CDMX date/time. */
export function buildIcs(iso: string, time: string, title: string, description: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, h + CDMX_OFFSET_H, min));
  const end = new Date(start.getTime() + 45 * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BLANK//Demo//ES",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@blank`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
