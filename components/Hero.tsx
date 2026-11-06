import HeroScene from "./hero/HeroScene";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <HeroScene />
      <div className="hero__copy wrap">
        <p className="hero__eyebrow" data-hero="eyebrow" aria-label="Tech & Business Strategy">
          <span className="hero__dot" aria-hidden="true" />
          <span className="hero__eyebrow-line" aria-hidden="true" />
          <span className="hero__eyebrow-text" aria-hidden="true">Tech &amp; Business Strategy</span>
        </p>
        <h1 className="hero__title" data-hero="title">
          El espacio
          <br />
          antes de la <em>inteligencia.</em>
        </h1>
        <p className="hero__lead" data-hero="lead">Todo empieza en un punto. Nosotros diseñamos el universo que viene después.</p>
        <div className="hero__actions" data-hero="actions">
          <a href="#demo" className="btn btn--light btn--glint">
            Agendar demo <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a href="#registro" className="btn btn--ghost btn--glint">Registrarse</a>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Desliza</span>
        <i />
      </div>
    </section>
  );
}
