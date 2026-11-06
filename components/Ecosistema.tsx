import { Horizon } from "./Art";
import LayersFigure, { LAYERS } from "./figures/layers/LayersFigure";
import { PointIcon, SpaceIcon, SystemIcon } from "./Icons";
import Wordmark from "./Wordmark";

const flow = [
  { Icon: SpaceIcon, name: "BLANK", tag: "The space.", text: "Estrategia y arquitectura del sistema." },
  { Icon: PointIcon, name: "NØDE", tag: "The point.", text: "Inteligencia individual y productividad aumentada." },
  { Icon: SystemIcon, name: "GRID", tag: "The system.", text: "Infraestructura empresarial integrada." },
];

export default function Ecosistema() {
  return (
    <section className="sec" id="ecosistema">
      <Horizon />
      <div className="wrap shead">
        <p className="eyebrow" data-fade>Ecosistema</p>
        <h2 className="h-section" data-split>
          Un ecosistema para diseñar, operar y escalar <em>negocios.</em>
        </h2>
        <p className="lead" data-fade>Estrategia, tecnología, sistemas, marca y comunicación conectados en una misma arquitectura.</p>
      </div>

      <div className="wrap eflow">
        {flow.map(({ Icon, name, tag, text }, i) => (
          <div key={name} className="eflow__item" data-fade>
            <span className="eflow__icon"><Icon /></span>
            <Wordmark name={name} className="eflow__mark" />
            <span className="eflow__tag">{tag}</span>
            <p>{text}</p>
            {i < flow.length - 1 ? <span className="eflow__arrow" aria-hidden="true">→</span> : null}
          </div>
        ))}
      </div>

      <div className="wrap connect">
        <div className="connect__copy">
          <h3 className="h-sub" data-fade>Cómo se conecta.</h3>
          <p className="lead" data-fade>Un mismo ecosistema, cuatro capas de inteligencia: ideas, personas y organización trabajando como una sola pieza.</p>
        </div>
        <div className="connect__art layers iso fig" data-rise>
          <LayersFigure />
          <ol className="layers__labels">
            {[...LAYERS].reverse().map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
