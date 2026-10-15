import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RuleOfThreeCalculator,
  GaugeCalculator,
  SavedCalculationsList,
} from "@/components/Calculators";

export const Route = createFileRoute("/_authenticated/calculadoras")({
  head: () => ({
    meta: [
      { title: "Calculadoras — Teje conmigo" },
      { name: "description", content: "Regla de tres y muestra de tensión para tus tejidos." },
      { property: "og:title", content: "Calculadoras — Teje conmigo" },
      {
        property: "og:description",
        content: "Regla de tres y muestra de tensión para tus tejidos.",
      },
    ],
  }),
  component: CalculadorasPage,
});

function CalculadorasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calculadoras de tejido"
        subtitle="Herramientas matemáticas para calcular puntos, vueltas y muestras de tensión proporcionales."
      />

      <Tabs defaultValue="regla-de-tres" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="regla-de-tres">Regla de tres</TabsTrigger>
          <TabsTrigger value="muestra">Muestra 10×10</TabsTrigger>
          <TabsTrigger value="guardados">Guardados</TabsTrigger>
        </TabsList>

        <TabsContent value="regla-de-tres" className="space-y-4">
          <RuleOfThreeCalculator />
        </TabsContent>

        <TabsContent value="muestra" className="space-y-4">
          <GaugeCalculator />
        </TabsContent>

        <TabsContent value="guardados" className="space-y-4">
          <SavedCalculationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
