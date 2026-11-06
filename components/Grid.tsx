import { GridFigure } from "./figures/LazyFigures";

export default function Grid() {
  return (
    <section className="chapter chapter--figure" id="grid">
      <div className="wrap stage stage--rev">
        <div className="stage__art" data-rise>
          <GridFigure />
        </div>
        <div className="stage__copy">
          <p className="eyebrow" data-fade>GRID — The system</p>
          <h2 className="h-section" data-split>
            Una empresa que piensa como una <em>sola mente.</em>
          </h2>
          <p className="lead" data-fade>Cada líder con su agente. Todos los agentes en un mismo contexto, coordinando decisiones.</p>
          <ul className="ticks" data-fade>
            <li>Un agente por tomador de decisión</li>
            <li>Contexto compartido y autorizado</li>
            <li>Integraciones a la medida</li>
          </ul>
          <div className="stage__cta" data-fade>
            <a href="#demo" data-product="GRID" className="btn btn--light">Diseñar mi GRID</a>
            <a href="#registro" data-plan="grid" className="link-arrow">Registrar mi empresa <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
