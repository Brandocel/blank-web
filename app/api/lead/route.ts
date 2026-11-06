import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { LEAD_TYPES, validateLead, type Lead } from "@/lib/leads";

export const runtime = "nodejs";

// Naive in-memory rate limit: 8 requests / minute / IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

function parse(body: unknown): Lead | null {
  if (!body || typeof body !== "object") return null;
  const { type, fields } = body as { type?: unknown; fields?: unknown };
  if (typeof type !== "string" || !LEAD_TYPES.includes(type as Lead["type"])) return null;
  if (!fields || typeof fields !== "object") return null;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields as Record<string, unknown>)) {
    if (typeof v === "string" && k.length < 40) clean[k] = v.trim();
  }
  return { type: type as Lead["type"], fields: clean };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Espera un minuto." }, { status: 429 });

  const lead = parse(await req.json().catch(() => null));
  if (!lead) return NextResponse.json({ ok: false, error: "Solicitud no válida." }, { status: 400 });

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (lead.fields.website) return NextResponse.json({ ok: true, id: "ok" });

  const error = validateLead(lead);
  if (error) return NextResponse.json({ ok: false, error }, { status: 422 });

  const { website: _hp, ...fields } = lead.fields;
  const record = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    type: lead.type,
    ...fields,
    userAgent: req.headers.get("user-agent") ?? "",
  };

  const results = await Promise.allSettled([store(record), forward(record)]);
  const stored = results.some((r) => r.status === "fulfilled" && r.value);
  if (!stored) {
    console.error("[lead] not persisted", results);
    return NextResponse.json({ ok: false, error: "No pudimos guardar tu solicitud. Escríbenos por WhatsApp." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: record.id });
}

/** Appends to data/leads.jsonl. Works on any Node host with a writable disk (not on read-only serverless). */
async function store(record: Record<string, string>) {
  try {
    const dir = path.join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(record) + "\n", "utf8");
    return true;
  } catch (e) {
    console.warn("[lead] file store unavailable:", (e as Error).message);
    return false;
  }
}

/** Optional: POST every lead to LEAD_WEBHOOK_URL (n8n, Make, Zapier, CRM…). */
async function forward(record: Record<string, string>) {
  const url = process.env.LEAD_WEBHOOK_URL;
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
