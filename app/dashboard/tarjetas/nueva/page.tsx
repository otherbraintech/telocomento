import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NuevaTarjetaForm from "./nueva-tarjeta-form";

export default function NuevaTarjetaPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Nueva Tarjeta de Monitoreo</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Configura una nueva alerta para que la IA inicie el rastreo de publicaciones.
          </p>
        </div>

        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Detalles de la Tarjeta</CardTitle>
            <CardDescription>
              Ingresa la palabra clave y las páginas a monitorear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NuevaTarjetaForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
