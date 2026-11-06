import { Orbit } from "./Art";
import CardArt, { type ArtKind } from "./CardArt";

const cats = ["Technology", "Business", "Brand", "AI", "Culture"];
const posts: { img: ArtKind; cat: string; title: string; min: number }[] = [
  { img: "waves", cat: "Technology", title: "El nuevo stack empresarial: IA, datos y automatización.", min: 10 },
  { img: "planes", cat: "Business", title: "De la estrategia al sistema: cómo operar con eficiencia.", min: 8 },
  { img: "moon", cat: "Brand", title: "La marca como infraestructura de crecimiento.", min: 12 },
  { img: "light", cat: "Culture", title: "Mentalidad, tecnología y liderazgo en la era de la IA.", min: 9 },
];

export default function Insights() {
  return (
    <section className="sec" id="insights">
      <div className="wrap shead shead--art">
        <div>
          <p className="eyebrow" data-fade>Insights</p>
          <h2 className="h-section" data-split>
            Ideas para negocios que piensan en el <em>largo plazo.</em>
          </h2>
          <p className="lead" data-fade>Perspectiva sobre tecnología, estrategia, marca, operación y cultura de negocio.</p>
        </div>
        <div className="shead__aside">
          <Orbit />
          <ul className="cats" data-fade>
            {cats.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>
      <div className="wrap posts">
        {posts.map((p) => (
          <article key={p.title} className="post">
            <div className="post__media">
              <CardArt kind={p.img} />
            </div>
            <div className="post__body">
              <p className="mono">{p.cat}</p>
              <h3>{p.title}</h3>
              <p className="post__meta">
                <span>{p.min} min de lectura</span>
                <span className="card-arrow" aria-hidden="true">→</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
