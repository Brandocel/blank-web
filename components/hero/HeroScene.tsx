"use client";

import Galaxy from "./Galaxy";
import StarTitle from "./StarTitle";

/** The hero's stage: the galaxy with the ecosystem's three bodies on their orbits, under a soft vignette. */
export default function HeroScene() {
  return (
    <>
      <Galaxy />
      <div className="hero__vignette" aria-hidden="true" />
      <StarTitle />
    </>
  );
}
