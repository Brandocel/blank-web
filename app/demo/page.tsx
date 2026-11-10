import type { Metadata } from "next";
import NodeDemo from "@/components/demo/NodeDemo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Demo en vivo de NØDE — BLANK",
  description: "Prueba NØDE con un espacio de ejemplo: documentos ficticios, IA real. Pregunta, decide y confirma acciones como si ya fuera tuyo.",
};

export default function DemoPage() {
  return <NodeDemo />;
}
