import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { LEAD_TYPES, checkLead, type Lead } from "@/lib/juanras/leads";

export const runtime = "nodejs";

// Naive in-memory rate limit: 6 requests / minute / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

function parse(body: unknown): Lead | null {
  if (!body || typeof body !== "object") return null;
  const { type, lang, fields } = body as { type?: unknown; lang?: unknown; fields?: unknown };
  if (typeof type !== "string" || !LEAD_TYPES.includes(type as Lead["type"])) return null;
  if (!fields || typeof fields !== "object") return null;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
    if (typeof v === "string" && k.length < 40) clean[k] = v.trim();
  }
  return { type: type as Lead["type"], lang: lang === "en" ? "en" : "es", fields: clean };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ ok: false, code: "rate" }, { status: 429 });

  const lead = parse(await req.json().catch(() => null));
  if (!lead) return NextResponse.json({ ok: false, code: "invalid" }, { status: 400 });

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (lead.fields.website) return NextResponse.json({ ok: true });

  const problem = checkLead(lead);
  if (problem) return NextResponse.json({ ok: false, ...problem }, { status: 422 });

  const { website: _hp, ...fields } = lead.fields;
  const record = { id: randomUUID(), receivedAt: new Date().toISOString(), kind: lead.type, lang: lead.lang, ...fields };

  const file = lead.type === "musician" ? "juanras-musicians.jsonl" : "juanras-bookings.jsonl";
  const results = await Promise.allSettled([store(file, record), forward(record)]);
  if (!results.some((r) => r.status === "fulfilled" && r.value)) {
    console.error("[juanras lead] not persisted", results);
    return NextResponse.json({ ok: false, code: "store" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: record.id });
}

/** Appends to data/<file>. Works on any Node host with a writable disk. */
async function store(file: string, record: Record<string, string>) {
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, file), JSON.stringify(record) + "\n", "utf8");
    return true;
  } catch (e) {
    console.warn("[juanras lead] file store unavailable:", (e as Error).message);
    return false;
  }
}

/** Optional: POST every lead to JUANRAS_WEBHOOK_URL (Google Sheet, n8n, a CRM…). */
async function forward(record: Record<string, string>) {
  const url = process.env.JUANRAS_WEBHOOK_URL;
  if (!url) return false;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}`);
  return true;
}
