import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Ecosistema from "@/components/Ecosistema";
import Proposito from "@/components/Proposito";
import Node from "@/components/Node";
import Grid from "@/components/Grid";
import Productos from "@/components/Productos";
import Soluciones from "@/components/Soluciones";
import Insights from "@/components/Insights";
import Proceso from "@/components/Proceso";
import Casos from "@/components/Casos";
import Principios from "@/components/Principios";
import Faq from "@/components/Faq";
import ContactHub from "@/components/ContactHub";
import Footer from "@/components/Footer";
import Motion from "@/components/Motion";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Saltar al contenido</a>
      <Nav />
      <main id="main">
        <Hero />
        <Ecosistema />
        <Proposito />
        <Productos />
        <Node />
        <Grid />
        <Soluciones />
        <Proceso />
        <Casos />
        <Principios />
        <Insights />
        <Faq />
        <ContactHub />
      </main>
      <Footer />
      <Motion />
    </>
  );
}
