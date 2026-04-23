import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TarjetaStatusToggle } from "@/components/tarjeta-status-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TarjetasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { scrapingCards: true } }
    }
  });

  const tarjetas = await prisma.scrapingCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { publications: true }
      }
    }
  });

  const currentCount = user?._count.scrapingCards || 0;
  const limit = user?.cardLimit || 0;
  const remaining = Math.max(0, limit - currentCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Tarjetas de Monitoreo</h1>
            <Badge variant={remaining === 0 ? "destructive" : "secondary"}>
              {currentCount} / {limit} Usadas
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Gestiona las palabras clave que el scraper rastreará.</p>
        </div>
        <Button asChild disabled={remaining === 0}>
          <Link href="/dashboard/tarjetas/nueva" className={remaining === 0 ? "pointer-events-none opacity-50" : ""}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarjeta
          </Link>
        </Button>
      </div>

      {tarjetas.length === 0 ? (
        <Card className="border-dashed border-border/50 bg-background/50 text-muted-foreground">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p className="mb-4">No tienes ninguna tarjeta de monitoreo configurada.</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/tarjetas/nueva">Crear la primera tarjeta</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tarjetas.map((tarjeta: any) => (
            <Card key={tarjeta.id} className="border-border/50 shadow-sm flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex justify-between items-start">
                  <span>{tarjeta.keyword}</span>
                  <TarjetaStatusToggle cardId={tarjeta.id} status={tarjeta.status} />
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={tarjeta.context || "Sin contexto"}>
                  Contexto: {tarjeta.context || "Ninguno proporcionado"}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Publicaciones encontradas: </span>
                  <span className="font-medium">{tarjeta._count.publications}</span>
                </div>
              </CardContent>
              <div className="border-t p-4 flex gap-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/dashboard/publicaciones?tarjetaId=${tarjeta.id}&keyword=${encodeURIComponent(tarjeta.keyword)}`}>Ver Publicaciones</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
