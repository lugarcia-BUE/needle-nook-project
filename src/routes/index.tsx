import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Clock, Hash, Package, BookOpen, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-tejido.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Teje conmigo — tu cuaderno de tejido" },
      {
        name: "description",
        content:
          "Proyectos, contadores de vueltas, calculadoras de muestra, materiales y patrones en un solo lugar.",
      },
      { property: "og:title", content: "Teje conmigo — tu cuaderno de tejido" },
      {
        property: "og:description",
        content:
          "Organizá tus proyectos de crochet y dos agujas con contadores, calculadoras y registro de tiempo.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Hash,
    t: "Contadores grandes",
    d: "Sumá vueltas con un toque y deshacé errores sin perder el historial.",
  },
  {
    icon: Calculator,
    t: "Calculadoras",
    d: "Regla de tres y muestra de tensión, explicadas paso a paso.",
  },
  {
    icon: Clock,
    t: "Tiempo de tejido",
    d: "Cronómetro por proyecto y estadísticas semanales y mensuales.",
  },
  {
    icon: Package,
    t: "Materiales",
    d: "Inventario de hilados y agujas, con cálculo de ovillos faltantes.",
  },
  {
    icon: BookOpen,
    t: "Biblioteca privada",
    d: "Guardá patrones en PDF, fotos y enlaces, sólo visibles para vos.",
  },
  { icon: ShoppingBasket, t: "Lista de compras", d: "Anotá lo que falta para cada proyecto." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-2xl font-semibold text-primary">Teje conmigo</span>
        <Button asChild variant="outline">
          <Link to="/auth">Ingresar</Link>
        </Button>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Tu cuaderno de tejido, siempre a mano.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Proyectos, vueltas, muestras, ovillos y patrones de crochet y dos agujas, ordenados y
            guardados de forma privada.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/auth" search={{ modo: "registro" }}>
                Crear mi cuenta
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="h-12 px-7 text-base">
              <Link to="/auth">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
        <img
          src={hero}
          alt="Ovillos de lana, aguja de crochet y un suéter verde salvia"
          width={1600}
          height={1008}
          className="aspect-[16/10] w-full rounded-3xl object-cover shadow-xl"
        />
      </section>
      <section className="bg-card/70 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.t} className="rounded-2xl border bg-background p-6">
              <f.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-3 text-xl font-semibold">{f.t}</h3>
              <p className="mt-1 text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="py-8 text-center text-sm text-muted-foreground">
        Hecho con cariño para quienes tejen.
      </footer>
    </div>
  );
}
