// Documentos ficticios del demo de NØDE. Todo es inventado: personas, empresas, montos y fechas.
// El demo vive en una fecha fija para que vencimientos y plazos siempre tengan sentido.

export const DEMO_TODAY = "martes 10 de noviembre de 2026";
export const DEMO_OWNER = "Mariana Robles, directora de Estudio Robles (arquitectura e interiorismo, CDMX)";

export type DemoDoc = { id: string; name: string; kind: string; origin: string; date: string; body: string };

export const demoDocs: DemoDoc[] = [
  {
    id: "contrato-altamar",
    name: "Contrato_Altamar_v3.pdf",
    kind: "Contrato",
    origin: "Correo",
    date: "2 oct 2026",
    body: `CONTRATO DE PRESTACIÓN DE SERVICIOS DE DISEÑO — VERSIÓN 3

Entre Grupo Hotelero Altamar, S.A. de C.V. ("el Cliente"), representado por Ing. Tomás Aguirre, y Estudio Robles, S.C. ("el Estudio"), representado por Arq. Mariana Robles.

1. OBJETO. Diseño interior y supervisión de obra del Hotel Altamar Tulum (84 habitaciones, lobby, restaurante y spa).

2. VIGENCIA. Del 1 de diciembre de 2025 al 30 de noviembre de 2026.

3. RENOVACIÓN. El contrato se renueva por 12 meses si cualquiera de las partes lo solicita por escrito al menos 15 días naturales antes del vencimiento (a más tardar el 15 de noviembre de 2026). Sin aviso, termina en la fecha de vencimiento.

4. HONORARIOS. $185,000.00 MXN mensuales más IVA, facturados el día 1 de cada mes, con pago a 20 días naturales.

5. AJUSTE EN RENOVACIÓN. En caso de renovación, los honorarios se ajustan conforme al INPC, con un tope de 6%. Cualquier ajuste mayor requiere convenio firmado por ambas partes.

6. MORA. Las facturas vencidas generan un interés de 2% mensual sobre el saldo.

7. ENTREGABLES PENDIENTES AL CIERRE. Planos ejecutivos del spa (entrega: 20 de noviembre de 2026) y paleta final de iluminación del lobby (entrega: 27 de noviembre de 2026).

8. PENALIZACIÓN. Cada semana de retraso en un entregable imputable al Estudio descuenta 3% de los honorarios del mes.

9. TERMINACIÓN ANTICIPADA. Cualquiera de las partes puede terminar con 30 días de aviso. El Cliente paga el trabajo realizado a la fecha.

10. CONFIDENCIALIDAD. Vigente durante el contrato y 2 años después.

Firmado en Ciudad de México el 28 de noviembre de 2025.`,
  },
  {
    id: "minuta-comite",
    name: "Minuta_Comite_Altamar_04nov.docx",
    kind: "Minuta",
    origin: "Drive",
    date: "4 nov 2026",
    body: `MINUTA — COMITÉ DE OBRA HOTEL ALTAMAR TULUM
Miércoles 4 de noviembre de 2026, 10:00–11:20, videollamada.

Asistentes: Tomás Aguirre (Altamar), Lucía Paredes (Altamar, finanzas), Mariana Robles (Estudio Robles), Diego Santana (Estudio Robles, líder de proyecto).

ACUERDOS
1. Altamar quiere renovar el contrato un año más, pero pide mantener honorarios sin ajuste por inflación. Mariana respondió que lo revisaría y contestaría antes del 13 de noviembre.
2. La apertura del hotel se mueve del 15 de enero al 1 de febrero de 2027 por retraso en la obra civil (no imputable al Estudio).
3. El spa cambia de proveedor de iluminación: se deja Lumínica y se cotiza con otros dos. Diego presenta comparativo el 12 de noviembre.
4. Lucía Paredes confirmó que la factura F-0921 "está en proceso de pago" y saldría esa misma semana.

PENDIENTES
- Mariana: respuesta sobre honorarios de renovación — 13 nov.
- Diego: comparativo de iluminación para spa — 12 nov.
- Diego: planos ejecutivos del spa — 20 nov (fecha de contrato).
- Lucía: comprobante de pago de F-0921 — 6 nov.
- Tomás: enviar carta formal de intención de renovación — sin fecha.

Próximo comité: miércoles 18 de noviembre, 10:00.`,
  },
  {
    id: "estado-octubre",
    name: "Estado_Cuenta_Octubre.xlsx",
    kind: "Finanzas",
    origin: "Drive",
    date: "3 nov 2026",
    body: `ESTUDIO ROBLES — ESTADO DE CUENTA, OCTUBRE 2026 (MXN)

INGRESOS COBRADOS
- Casa Loma Bonita (residencial), anticipo fase 2 ........ 96,000
- Restaurante Nogal, pago final ........................... 142,500
- Corporativo Vértice, iguala mensual ..................... 78,000
Total cobrado ............................................. 316,500

CUENTAS POR COBRAR
- F-0921 Grupo Hotelero Altamar, honorarios octubre ....... 214,600 (185,000 + IVA). Emitida 1 oct, venció 21 oct. VENCIDA.
- F-0934 Grupo Hotelero Altamar, honorarios noviembre ..... 214,600. Emitida 1 nov, vence 21 nov.
- F-0930 Corporativo Vértice, iguala noviembre ............ 90,480. Vence 25 nov.
Total por cobrar .......................................... 519,680

EGRESOS
- Nómina (7 personas) ..................................... 248,300
- Renta de oficina ........................................ 42,000
- Software y licencias .................................... 18,750
- Proveedores (renders, impresión, muestras) .............. 61,400
- Impuestos y contabilidad ................................ 54,900
Total egresos ............................................. 425,350

RESULTADO DEL MES (cobrado − egresos) ..................... −108,850
SALDO EN BANCO AL 31 OCT .................................. 187,240

NOTAS DEL CONTADOR
- Altamar representa 47% de la facturación anual.
- Si F-0921 no entra antes del 15 de noviembre, la nómina de la segunda quincena queda descubierta por unos 60,000.
- Tercer mes del año con resultado negativo (marzo, julio, octubre).`,
  },
  {
    id: "correo-luminica",
    name: "Correo_Luminica_aumento.eml",
    kind: "Correo",
    origin: "Correo",
    date: "6 nov 2026",
    body: `De: Renata Olmos <ventas@luminica.example>
Para: Mariana Robles
Fecha: viernes 6 de noviembre de 2026, 17:42
Asunto: Ajuste de lista de precios y pedido Altamar lobby

Hola Mariana,

Te aviso que a partir del 1 de diciembre nuestra lista de precios sube 12% por tipo de cambio.

Tienes cotizado el pedido del lobby de Altamar (cotización LUM-4471, 312 luminarias, $684,000 + IVA). Si nos confirmas el pedido con 30% de anticipo a más tardar el viernes 14 de noviembre, te respetamos el precio actual y entregamos en obra la semana del 11 de enero.

Después del 14 ya no puedo sostenerlo y la entrega se iría a la semana del 8 de febrero.

Entiendo que para el spa van a cotizar con alguien más; sin problema, pero el lobby sí lo tenemos listo para producir.

Quedo atenta,
Renata Olmos
Lumínica Iluminación Arquitectónica`,
  },
  {
    id: "plan-2027",
    name: "Plan_Estudio_2027.md",
    kind: "Plan",
    origin: "Notas",
    date: "19 oct 2026",
    body: `PLAN 2027 — ESTUDIO ROBLES (borrador de Mariana)

OBJETIVO DEL AÑO
Dejar de depender de un solo cliente. Que ningún cliente pese más de 30% de la facturación.

METAS
1. Facturar 6.2 millones (2026 cerrará cerca de 5.4).
2. Tres clientes de hospitalidad activos (hoy solo Altamar).
3. Margen operativo de 18% (2026: aprox. 9%).
4. Contratar un segundo líder de proyecto en el primer trimestre.

PROSPECTOS
- Hotel Boca de Cielo (Oaxaca): propuesta enviada 9 oct, sin respuesta. Presupuesto estimado 2.1 millones.
- Cadena Nogal (2 restaurantes nuevos): Pablo Nogal pidió propuesta "para noviembre".
- Residencial Los Encinos: referido por Casa Loma Bonita, primera llamada pendiente.

RIESGOS
- Si Altamar no renueva, el primer semestre queda con hueco de 1.1 millones.
- Diego ha pedido aumento; sin segundo líder, está al límite de carga.

IDEAS SUELTAS
- Cobrar anticipo trimestral a clientes de hospitalidad.
- Subir tarifa 8% a clientes nuevos.
- Dejar de aceptar residencial menor a 400 mil.`,
  },
  {
    id: "notas-voz",
    name: "Notas_de_voz_lunes.txt",
    kind: "Nota de voz",
    origin: "WhatsApp",
    date: "9 nov 2026",
    body: `TRANSCRIPCIÓN — NOTAS DE VOZ DE MARIANA, LUNES 9 DE NOVIEMBRE DE 2026

08:14 — Recordar que el jueves 12 es la junta de papás en la escuela de Emilia a las 8:30, no agendar nada antes de las 10.

08:20 — Lucía de Altamar dijo que pagaban la semana pasada y no ha caído nada. Hay que escribirle hoy o mañana, pero sin sonar desesperada porque estamos negociando la renovación.

11:02 — Pablo Nogal me llamó, quiere la propuesta de los dos restaurantes antes del 20. Pedirle a Diego horas estimadas.

13:47 — Lo de Lumínica: no sé si conviene amarrar el pedido del lobby ya. Es dinero de Altamar, no nuestro, pero el anticipo lo tendría que autorizar Tomás y con el cambio de fecha de apertura igual ya no urge. Pensarlo.

18:30 — Vuelo a Tulum para visita de obra: 24 y 25 de noviembre. Falta comprar.`,
  },
];

export const demoSuggestions = [
  "¿Qué vence esta semana y qué pasa si no hago nada?",
  "Redacta el correo para cobrar la factura F-0921 sin tensar la renovación.",
  "¿Me conviene renovar con Altamar sin ajuste de honorarios?",
  "Arma mi plan para los próximos 7 días.",
  "¿Confirmo el pedido de Lumínica antes del 14?",
];

export type DemoAction = {
  tipo: "archivar" | "recordatorio" | "borrador" | "tarea";
  titulo: string;
  detalle?: string;
  fecha?: string;
  contenido?: string;
};

export const ACTION_TYPES: DemoAction["tipo"][] = ["archivar", "recordatorio", "borrador", "tarea"];

export const demoSystemPrompt = `Eres NØDE, la inteligencia personal de BLANK, funcionando en un demo público dentro del sitio de BLANK.

En este demo trabajas para ${DEMO_OWNER}. La persona que te escribe es un visitante del sitio que está probando NØDE como si fuera Mariana; trátala como a tu usuaria. Todos los datos son ficticios. En este demo, hoy es ${DEMO_TODAY}; calcula plazos y vencimientos contra esa fecha.

Lo que hace NØDE: une información dispersa (correo, Drive, notas, WhatsApp) y la convierte en contexto y en acción. No solo responde preguntas sobre un documento: cruza documentos entre sí, detecta contradicciones, riesgos y plazos, da una recomendación con criterio, y propone acciones concretas. Ese cruce es lo que el visitante vino a ver, así que cuando una pregunta toca varios documentos, muéstralo: di de dónde sale cada dato citando el nombre del archivo.

Cómo trabajas:
- Responde en español de México, en tono directo y cálido, como un jefe de gabinete de confianza. Ve primero a la respuesta y después al sustento. Sé breve: casi siempre bastan de 60 a 150 palabras, más si te piden un borrador o un plan.
- Escribe en texto plano. La interfaz no interpreta Markdown, así que evita asteriscos, almohadillas y tablas; para listas usa guiones o números.
- Apóyate solo en los documentos de abajo y en lo que la usuaria te diga. Si algo no está ahí, dilo y ofrece qué haría falta para saberlo; un dato inventado en un demo de confianza cuesta más que un "eso no lo tengo".
- Cuando haya una decisión, da tu recomendación y la razón, y señala qué queda a criterio de ella.
- Nunca ejecutas nada sensible sin aprobación. Cuando convenga actuar (archivar un documento, crear un recordatorio, dejar un borrador de correo o mensaje, anotar una tarea), explica brevemente tu propuesta y termina el mensaje con un bloque de acciones que la interfaz mostrará como tarjeta de "Confirmar / Editar". No digas que algo ya quedó hecho: la interfaz lo ejecuta cuando ella confirma.

Formato del bloque de acciones (va al final del mensaje, una sola vez, y solo cuando propongas acciones):
<acciones>[{"tipo":"recordatorio","titulo":"Avisar renovación a Altamar","fecha":"13 nov, 9:00","detalle":"Límite contractual: 15 nov"}]</acciones>
- Es un arreglo JSON válido en una sola línea, de 1 a 5 acciones.
- "tipo" es uno de: "archivar", "recordatorio", "borrador", "tarea".
- "titulo" es obligatorio y corto. "detalle" y "fecha" son opcionales.
- En "borrador", pon el texto completo del correo o mensaje en "contenido" (con saltos de línea como \\n) y no lo repitas en el cuerpo de tu respuesta; ahí solo resume el enfoque.
- En "archivar", "titulo" es el nombre del archivo y "detalle" la carpeta destino.

Si el visitante pregunta por NØDE, BLANK, precios o cómo contratarlo: explica en una o dos frases que esto es un demo con datos de ejemplo, que en la versión real NØDE se conecta a su propio correo, archivos y calendario, y que puede registrarse o agendar una conversación desde el sitio. No inventes precios ni funciones. Si te piden algo ajeno al demo (tareas generales sin relación con estos documentos o con NØDE), di con amabilidad que este demo está limitado a este espacio de ejemplo.

Documentos en el espacio de Mariana:

${demoDocs.map((d) => `<documento nombre="${d.name}" tipo="${d.kind}" origen="${d.origin}" fecha="${d.date}">\n${d.body}\n</documento>`).join("\n\n")}`;
