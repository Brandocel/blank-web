import { Crescent } from "./Art";
import { PointIcon, SpaceIcon, SystemIcon } from "./Icons";
import Wordmark from "./Wordmark";

const products = [
  { Icon: SpaceIcon, name: "BLANK", tag: "The space.", text: "Plataforma estratégica para diseñar, estructurar y activar sistemas de negocio.", href: "#demo", product: "Consultoría BLANK" },
  { Icon: PointIcon, name: "NØDE", tag: "The point.", text: "Tu infraestructura personal de inteligencia. Organiza, crea, decide y ejecuta con IA.", href: "#node" },
  { Icon: SystemIcon, name: "GRID", tag: "The system.", text: "Infraestructura de inteligencia empresarial. Equipos, procesos, datos y tecnología en un solo sistema.", href: "#grid" },
];

export default function Productos() {
  return (
    <section className="sec" id="productos">
      <Crescent />
      <div className="wrap shead">
        <p className="eyebrow" data-fade>Productos</p>
        <h2 className="h-section" data-split>
          Productos que convierten inteligencia en <em>acción.</em>
        </h2>
        <p className="lead" data-fade>Herramientas y plataformas diseñadas para personas, equipos y organizaciones.</p>
      </div>
      <ul className="wrap plist">
        {products.map(({ Icon, name, tag, text, href, product }) => (
          <li key={name} data-fade>
            <a href={href} className="plist__row" data-product={product}>
              <span className="plist__icon"><Icon /></span>
              <span className="plist__name">
                <Wordmark name={name} className="plist__mark" />
                <span>{tag}</span>
              </span>
              <span className="plist__text">{text}</span>
              <span className="plist__arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
