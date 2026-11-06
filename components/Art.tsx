/** Atmospheric art for section heads: the horizon, the crescent, the orbit and the beam. Pure SVG/CSS, animated by Motion. */

export function Horizon() {
  return (
    <svg className="art art--horizon" viewBox="0 0 800 420" aria-hidden="true" preserveAspectRatio="xMaxYMin slice">
      <defs>
        <radialGradient id="hz-body" cx="62%" cy="118%" r="95%">
          <stop offset="0.7" stopColor="#0a0a0a" />
          <stop offset="0.86" stopColor="#151515" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
        <linearGradient id="hz-rim" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>
        <filter id="hz-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <circle cx="640" cy="980" r="900" fill="url(#hz-body)" />
      <circle className="hz-glow" cx="640" cy="980" r="900" fill="none" stroke="url(#hz-rim)" strokeWidth="26" filter="url(#hz-blur)" />
      <circle cx="640" cy="980" r="900" fill="none" stroke="url(#hz-rim)" strokeWidth="1.4" />
    </svg>
  );
}

export function Crescent() {
  return (
    <div className="art art--crescent" aria-hidden="true">
      <div className="crescent__glow" />
      <div className="crescent__body" />
    </div>
  );
}

export function Orbit() {
  return (
    <svg className="art art--orbit" viewBox="0 0 420 420" aria-hidden="true">
      <defs>
        <radialGradient id="ob-planet" cx="68%" cy="34%" r="80%">
          <stop offset="0" stopColor="#e9e9e6" />
          <stop offset="0.18" stopColor="#8a8a87" />
          <stop offset="0.42" stopColor="#1c1c1c" />
          <stop offset="0.7" stopColor="#060606" />
        </radialGradient>
        <filter id="ob-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <circle cx="210" cy="210" r="96" fill="#fff" opacity="0.06" filter="url(#ob-glow)" />
      <g className="orbit__ring">
        <ellipse cx="210" cy="210" rx="190" ry="186" fill="none" stroke="rgba(255,255,255,.18)" />
      </g>
      <circle cx="210" cy="210" r="88" fill="url(#ob-planet)" />
      <g className="orbit__sat">
        <circle cx="400" cy="210" r="3" fill="#fff" />
      </g>
      <g className="orbit__sat orbit__sat--2">
        <circle cx="20" cy="210" r="2.2" fill="#fff" opacity=".8" />
      </g>
    </svg>
  );
}

export function Beam() {
  return (
    <div className="art art--beam" aria-hidden="true">
      <div className="beam__wall" />
      <div className="beam__light" />
      <div className="beam__edge" />
    </div>
  );
}
