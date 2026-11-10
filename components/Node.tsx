import { NodeFigure } from "./figures/LazyFigures";
import NodeFlow from "./NodeFlow";

export default function Node() {
  return (
    <section className="chapter chapter--figure" id="node">
      <div className="wrap stage">
        <div className="stage__copy">
          <p className="eyebrow" data-fade>NØDE — The point</p>
          <h2 className="h-section" data-split>
            Todo lo tuyo, en un solo <em>punto.</em>
          </h2>
          <p className="lead" data-fade>NØDE no guarda información. Construye contexto: une lo que hoy vive disperso y lo convierte en acción.</p>
          <div className="stage__cta" data-fade>
            <a href="#registro" data-plan="node" className="btn btn--light">Activar NØDE</a>
            <a href="/demo" className="link-arrow">Probarlo en vivo <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="stage__art" data-rise>
          <NodeFigure />
        </div>
      </div>

      <NodeFlow />
    </section>
  );
}
