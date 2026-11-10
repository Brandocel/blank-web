"use client";

import { useSite } from "./Site";

function Label({ side, name, id }: { side: "A" | "B"; name: string; id: string }) {
  const ring = `The Juanras ✦ ${name} ✦ Cancún ✦ Riviera Maya ✦ `;
  return (
    <svg className={`jr-label jr-label--${side.toLowerCase()}`} viewBox="0 0 200 200" aria-hidden="true">
      <circle className="jr-label__paper" cx="100" cy="100" r="100" />
      <defs>
        <path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
      </defs>
      <text className="jr-label__ring" textLength="496" lengthAdjust="spacing">
        <textPath href={`#${id}`}>{ring.toUpperCase()}</textPath>
      </text>
      <text className="jr-label__side" x="100" y="78" textAnchor="middle">{side}</text>
      <text className="jr-label__rpm" x="100" y="150" textAnchor="middle">{side === "A" ? "33⅓ RPM" : "45 RPM"}</text>
      <circle cx="100" cy="100" r="5" fill="#000" />
    </svg>
  );
}

/** The one big moment of the page: the record turns over and the night changes colour. */
export default function Flip() {
  const { t } = useSite();
  return (
    <section className="jr-flip" aria-label={`${t.flip.word} B`}>
      <p className="jr-flip__word jr-flip__word--a" aria-hidden="true">{t.flip.word} A</p>
      <div className="jr-flip__night">
        <h2 className="jr-flip__word jr-flip__word--b" id="lado-b">{t.flip.word} B</h2>
      </div>
      <p className="jr-flip__cue">{t.flip.cue}</p>
      <div className="jr-record" aria-hidden="true">
        <div className="jr-record__lift">
          <div className="jr-record__turn">
            <div className="jr-record__face">
              <Label side="A" name={t.flip.labelA} id="jr-ring-a" />
            </div>
            <div className="jr-record__face jr-record__face--b">
              <Label side="B" name={t.flip.labelB} id="jr-ring-b" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
