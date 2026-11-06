export const SpaceIcon = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <path d="M8 15V8h7M25 8h7v7M32 25v7h-7M15 32H8v-7" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const PointIcon = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <circle cx="20" cy="20" r="6" fill="currentColor" />
  </svg>
);

export const SystemIcon = () => (
  <svg viewBox="0 0 40 40" aria-hidden="true">
    <g fill="currentColor">
      {[12, 20, 28].flatMap((y) => [12, 20, 28].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />))}
    </g>
  </svg>
);
