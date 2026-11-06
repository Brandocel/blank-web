"use client";

import dynamic from "next/dynamic";

/**
 * The NØDE and GRID figures compute their paths with trigonometry; Node and the browser round the
 * last decimal differently, so server and client markup never match exactly. They render in the
 * browser only, with their box reserved so nothing shifts while they load.
 */
const Placeholder = () => <div className="fig-placeholder" aria-hidden="true" />;

export const NodeFigure = dynamic(() => import("./node/NodeFigure"), { ssr: false, loading: Placeholder });
export const GridFigure = dynamic(() => import("./grid/GridFigure"), { ssr: false, loading: Placeholder });
