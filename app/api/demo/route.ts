import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { demoSystemPrompt } from "@/lib/demo-docs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_VISITOR = Number(process.env.DEMO_MESSAGES_PER_VISITOR ?? 20); // por IP, por día
const DAILY_CAP = Number(process.env.DEMO_DAILY_CAP ?? 1500); // todo el sitio, por día
const MAX_CHARS = 2000;
const MAX_TURNS = 40;

// Contadores en memoria: se reinician con cada deploy o reinicio del servicio.
let day = "";
let total = 0;
const used = new Map<string, number>();
function roll() {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    total = 0;
    used.clear();
  }
}
const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return (client ??= new Anthropic());
}

export async function GET(req: Request) {
  roll();
  const left = Math.max(0, PER_VISITOR - (used.get(ipOf(req)) ?? 0));
  return NextResponse.json({ ready: Boolean(getClient()), limit: PER_VISITOR, remaining: total >= DAILY_CAP ? 0 : left });
}

function parse(body: unknown): Anthropic.MessageParam[] | null {
  const list = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_TURNS) return null;
  const out: Anthropic.MessageParam[] = [];
  for (const m of list) {
    const { role, content } = (m ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) return null;
    // Las respuestas de NØDE pueden ser largas (borradores); solo se acota lo que escribe el visitante.
    if (role === "user" && text.length > MAX_CHARS) return null;
    out.push({ role, content: text.slice(0, 12_000) });
  }
  if (out[0].role !== "user" || out[out.length - 1].role !== "user") return null;
  return out;
}

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  const anthropic = getClient();
  if (!anthropic) return fail("El demo en vivo aún no está activo. Agenda una conversación y te lo mostramos.", 503);

  const messages = parse(await req.json().catch(() => null));
  if (!messages) return fail("Mensaje no válido o demasiado largo.", 400);

  roll();
  const ip = ipOf(req);
  const count = used.get(ip) ?? 0;
  if (count >= PER_VISITOR) return fail("Llegaste al límite de mensajes del demo por hoy. Regístrate para activar tu NØDE.", 429);
  if (total >= DAILY_CAP) return fail("El demo alcanzó su capacidad de hoy. Vuelve mañana o agenda una conversación.", 429);
  used.set(ip, count + 1);
  total += 1;

  const stream = anthropic.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    // Si el modelo principal declina una solicitud, la API la reintenta en un modelo de respaldo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: demoSystemPrompt, cache_control: { type: "ephemeral" } }],
    messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") send(event.delta.text);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") send("\n\nNo puedo ayudar con eso dentro del demo. Prueba con otra pregunta sobre los documentos.");
        if (final.stop_reason === "max_tokens") send("\n\n(Respuesta recortada por el límite del demo.)");
      } catch (error) {
        if (error instanceof Anthropic.APIUserAbortError) return;
        if (error instanceof Anthropic.RateLimitError) send("\n\nHay mucha demanda en este momento. Intenta de nuevo en un minuto.");
        else if (error instanceof Anthropic.AuthenticationError) send("\n\nEl demo no está bien configurado. Avísanos por WhatsApp.");
        else send("\n\nNo pude completar la respuesta. Intenta de nuevo.");
        console.error("[demo]", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Demo-Remaining": String(PER_VISITOR - count - 1),
    },
  });
}
