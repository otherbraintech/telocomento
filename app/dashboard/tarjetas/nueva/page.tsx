import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NuevaTarjetaForm from "./nueva-tarjeta-form";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NuevaTarjetaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cardLimit: true,
      _count: { select: { scrapingCards: true } }
    }
  });

  const limit = user?.cardLimit || 0;
  const current = user?._count.scrapingCards || 0;

  if (limit === 0 || current >= limit) {
    redirect("/dashboard/tarjetas");
  }

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
              Ingresa la palabra clave que se usará para buscar en Facebook.
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
