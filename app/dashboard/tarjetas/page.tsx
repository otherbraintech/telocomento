import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TarjetaStatusToggle } from "@/components/tarjeta-status-toggle";
import { CardActions } from "@/components/card-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { RequestTicketsButton } from "@/components/request-tickets-button";
import { NuevaTarjetaDialog } from "@/components/nueva-tarjeta-dialog";

export default async function TarjetasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cardLimit: true,
      isRequestingTickets: true,
      _count: { select: { scrapingCards: true } }
    }
  });

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tarjetas = await prisma.scrapingCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { publications: true }
      },
      publications: {
        where: { createdAt: { gte: last24h } },
        select: { id: true }
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
        <div className="flex gap-2">
          {remaining === 0 && (
            <RequestTicketsButton isAlreadyRequesting={user?.isRequestingTickets || false} />
          )}
          {limit > 0 && (
            <NuevaTarjetaDialog remaining={remaining} />
          )}
        </div>
      </div>

      {tarjetas.length === 0 ? (
        <Card className="border-dashed border-border/50 bg-background/50 text-muted-foreground">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            {limit === 0 ? (
              <>
                <p className="mb-4">Tu cuenta actualmente no tiene capacidad para crear tarjetas de monitoreo.</p>
                <RequestTicketsButton isAlreadyRequesting={user?.isRequestingTickets || false} />
              </>
            ) : (
              <>
                <p className="mb-4">No tienes ninguna tarjeta de monitoreo configurada.</p>
                <NuevaTarjetaDialog remaining={remaining} />
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tarjetas.map((tarjeta: any) => (
            <Card key={tarjeta.id} className="border-border/50 shadow-sm flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex justify-between items-start gap-2">
                  <span className="truncate">{tarjeta.keyword}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <TarjetaStatusToggle cardId={tarjeta.id} status={tarjeta.status} />
                    <CardActions card={tarjeta} />
                  </div>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={tarjeta.context || "Sin contexto"}>
                  Contexto: {tarjeta.context || "Ninguno proporcionado"}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium">{tarjeta._count.publications}</span>
                  </div>
                  {tarjeta.publications.length > 0 && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 transition-colors">
                      +{tarjeta.publications.length} hoy
                    </Badge>
                  )}
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
