/**
 * The manifesto, told in four acts while the page holds still. Each act is read word by word:
 * a word arrives faint and soft and becomes ink as you scroll past it. Behind the words, one point
 * grows into an open space with a satellite on its orbit; at the last act the point beats and sends
 * out waves. Below, a spark runs the timeline and lights each stage as it passes: agency to legacy.
 */

const ACTS = [
  { k: "Origen", text: <>Todo lo que hoy existe, alguna vez fue un <em>espacio en blanco.</em></> },
  { k: "Intención", text: <>Ahí empezamos. Donde una idea todavía <em>no tiene forma.</em></> },
  { k: "Construcción", text: <>Le damos estrategia, sistema, marca e <em>inteligencia.</em></> },
  { k: "Permanencia", text: <>Y la convertimos en algo que <em>permanece.</em></> },
];

const STAGES = [
  ["Agencia", "Donde nacimos."],
  ["Plataforma", "Donde creamos."],
  ["Infraestructura", "Donde operamos."],
  ["Patrimonio", "Lo que dejamos."],
];

export default function Proposito() {
  return (
    <section className="manifesto" id="proposito" aria-label="Propósito">
      <div className="manifesto__pin">
        <svg className="manifesto__space" viewBox="0 0 600 600" aria-hidden="true">
          <g className="ms-spin">
            <circle className="ms-ring ms-ring--3" cx="300" cy="300" r="280" />
          </g>
          <circle className="ms-ring ms-ring--2" cx="300" cy="300" r="190" />
          <circle className="ms-ring ms-ring--1" cx="300" cy="300" r="100" />
          <g className="ms-orbit">
            <circle className="ms-sat" cx="490" cy="300" r="3.5" />
          </g>
          <circle className="ms-wave" cx="300" cy="300" r="10" />
          <circle className="ms-wave ms-wave--2" cx="300" cy="300" r="10" />
          <circle className="ms-point" cx="300" cy="300" r="5" />
        </svg>

        <div className="wrap manifesto__inner">
          <div className="manifesto__rail" aria-hidden="true">
            <span className="mono">Propósito</span>
            <span className="manifesto__count">
              <b className="manifesto__now">01</b>
              <i>/</i>04
            </span>
            <span className="manifesto__steps">
              {ACTS.map((a) => (
                <span key={a.k}>
                  <i />
                </span>
              ))}
            </span>
            <span className="manifesto__act mono">{ACTS[0]!.k}</span>
          </div>

          <div className="manifesto__acts">
            {ACTS.map((a, i) => (
              <p key={a.k} className="manifesto__text" data-act={i} data-k={a.k}>
                {a.text}
              </p>
            ))}
          </div>

          <div className="evo">
            <div className="evo__track" aria-hidden="true">
              <span className="evo__fill" />
              <span className="evo__spark" />
            </div>
            <ol className="evo__stages" aria-label="Evolución de BLANK">
              {STAGES.map(([s, d], i) => (
                <li key={s} data-stage={i}>
                  <span className="evo__node" aria-hidden="true" />
                  <span className="mono">0{i + 1}</span>
                  <b>{s}</b>
                  <small>{d}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
