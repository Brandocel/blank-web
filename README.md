# BLANK — sitio web

Next.js 16 (App Router) + TypeScript + Node. Sitio de una página para BLANK, NØDE y GRID con tres vías de conversión: **Agendar demo**, **Registrarse** y **Escribir**, más suscripción a Insights.

## Correr

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # producción
```

Requiere Node 20.9 o superior.

## Configurar

Copia `.env.example` a `.env.local` y ajusta:

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_CONTACT_EMAIL` | Correo visible en la sección Escribir |
| `NEXT_PUBLIC_WHATSAPP` | Número en formato internacional sin `+` (ej. `5215512345678`) |
| `NEXT_PUBLIC_INSTAGRAM` | Usuario de Instagram sin `@` |
| `LEAD_WEBHOOK_URL` | Opcional. Cada solicitud se envía como JSON a esta URL (n8n, Make, Zapier, CRM) |

## Solicitudes (leads)

Todos los formularios envían a `POST /api/lead` (`app/api/lead/route.ts`), que:

1. Valida los campos (misma validación en cliente y servidor: `lib/leads.ts`).
2. Filtra bots con un campo oculto (honeypot) y limita a 8 envíos por minuto por IP.
3. Guarda cada solicitud en `data/leads.jsonl` (una línea JSON por solicitud).
4. Si existe `LEAD_WEBHOOK_URL`, la reenvía ahí.

Tipos: `demo`, `registro`, `mensaje`, `newsletter`.

> En hosting serverless (Vercel, Netlify) el disco es de solo lectura: configura `LEAD_WEBHOOK_URL` para no perder solicitudes. En un servidor Node propio (VPS, Railway, Render) el archivo funciona tal cual.

## Estructura

```
app/
  layout.tsx        fuentes, metadata
  page.tsx          orden de secciones
  globals.css       todo el estilo (tokens al inicio)
  api/lead/route.ts endpoint de formularios
components/         una sección por archivo; ContactHub = demo / registro / escribir
lib/
  site.ts           datos de contacto y navegación
  leads.ts          tipos, validación y envío
  calendar.ts       horarios de demo (hora CDMX) y archivo .ics
```

Los horarios de demo están en `lib/calendar.ts` (`SLOTS`), lunes a viernes, hasta 60 días adelante.
