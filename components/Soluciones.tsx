import Wave from "./Wave";

const S = { stroke: "currentColor", fill: "none", strokeWidth: 1.2 } as const;
const icons = {
  layers: (
    <>
      <path d="M12 4 3 8.5l9 4.5 9-4.5L12 4Z" {...S} />
      <path d="m3 12.5 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" {...S} />
    </>
  ),
  spark: <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" {...S} />,
  rings: (
    <>
      <circle cx="9" cy="12" r="5.5" {...S} />
      <circle cx="15" cy="12" r="5.5" {...S} />
    </>
  ),
  infinity: <path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 1 0 0 8c1.9 0 3.5-1.3 5.5-4Zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 1 0 0-8c-1.9 0-3.5 1.3-5.5 4Z" {...S} />,
  arrow: <path d="M6 18 18 6M9 6h9v9" {...S} />,
  dots: (
    <g fill="currentColor">
      <circle cx="6" cy="7" r="1.2" />
      <circle cx="17" cy="6" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="7" cy="17" r="1.2" />
      <circle cx="18" cy="17" r="1.2" />
    </g>
  ),
};

const items: [keyof typeof icons, string, string][] = [
  ["layers", "Estrategia de negocio", "Diagnóstico, modelo, crecimiento y transformación."],
  ["spark", "Tecnología e IA", "Automatización, agentes, datos y plataformas."],
  ["rings", "Marca y comunicación", "Posicionamiento, narrativa, fotografía y cine."],
  ["infinity", "Sistemas operativos", "Procesos, personas, herramientas y medición."],
  ["arrow", "Go-to-Market", "Lanzamiento, expansión y activación comercial."],
  ["dots", "Acompañamiento estratégico", "Ejecución, optimización y evolución continua."],
];

export default function Soluciones() {
  return (
    <section className="sec" id="soluciones">
      <Wave />
      <div className="wrap shead">
        <p className="eyebrow" data-fade>Soluciones</p>
        <h2 className="h-section" data-split>
          Soluciones integrales para retos de negocio <em>reales.</em>
        </h2>
        <p className="lead" data-fade>Diseñamos e implementamos sistemas que alinean estrategia, tecnología, marca y operación.</p>
      </div>
      <ul className="wrap sgrid">
        {items.map(([icon, title, text]) => (
          <li key={title} className="sgrid__item" data-fade>
            <a href="#escribir">
              <svg viewBox="0 0 24 24" className="sgrid__icon" aria-hidden="true">{icons[icon]}</svg>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="sgrid__arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
