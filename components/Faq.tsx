const faqs = [
  ["¿Qué es BLANK exactamente?", "Una plataforma de estrategia, tecnología, marca y comunicación. Nacimos como agencia y hoy desarrollamos activos tecnológicos y de comunicación para empresas, incluidos nuestros productos NØDE y GRID."],
  ["¿Cuál es la diferencia entre NØDE y GRID?", "NØDE es inteligencia para una persona: centraliza y opera su información. GRID es inteligencia para una empresa: cada tomador de decisión tiene un agente y los agentes comparten contexto autorizado y coordinan acciones."],
  ["¿NØDE actúa sin mi permiso?", "No. La lógica es Entender → Proponer → Confirmar → Ejecutar → Registrar. Antes de cualquier acción sensible o de seguimiento recibes una propuesta o vista previa para aprobarla."],
  ["¿Cuánto dura un proyecto con BLANK?", "Los proyectos de estrategia y consultoría suelen durar entre 3 y 12 meses. NØDE y GRID funcionan por suscripción o licencia una vez implementados."],
];

export default function Faq() {
  return (
    <section className="chapter" id="faq">
      <div className="wrap faq">
        <div>
          <p className="chapter__num" data-fade>Preguntas</p>
          <h2 className="display display--sm" data-split>
            Antes de <em>empezar.</em>
          </h2>
        </div>
        <div className="faq__list">
          {faqs.map(([q, a]) => (
            <details key={q} data-fade>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
