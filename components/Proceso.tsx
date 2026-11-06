const steps = [
  ["Diagnóstico", "Entender antes de mover."],
  ["Diseño", "La arquitectura de lo que viene."],
  ["Construcción", "Sistemas, IA, marca."],
  ["Implementación", "Que tu equipo lo haga suyo."],
  ["Evolución", "Medir. Ajustar. Crecer."],
];

export default function Proceso() {
  return (
    <section className="hscroll" id="proceso">
      <div className="hscroll__pin">
        <div className="wrap hscroll__head">
          <p className="chapter__num">Proceso de valor</p>
          <h2 className="display display--sm" data-split>
            Del diagnóstico
            <br />a la <em>evolución.</em>
          </h2>
        </div>
        <ol className="hscroll__track">
          {steps.map(([t, d], i) => (
            <li key={t} className="hstep">
              <span className="hstep__num">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
          <li className="hstep hstep--model">
            <span className="mono">Modelo</span>
            <p className="hstep__model">
              Consultoría <i>+</i> Implementación <i>+</i> Licencias NØDE y GRID
            </p>
          </li>
        </ol>
        <div className="wrap hscroll__bar" aria-hidden="true"><span /></div>
      </div>
    </section>
  );
}
