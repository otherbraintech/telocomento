import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function OrdenesPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      publication: {
        include: { scrapingCard: true }
      },
      _count: { select: { comments: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Órdenes y Comentarios</h1>
        <p className="text-sm text-muted-foreground">Seguimiento de las órdenes enviadas a la IA y estado de los bots.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <p>No tienes ninguna orden generada.</p>
            <p className="text-sm mt-2">Ve a la sección de Publicaciones para aprobar contenido y crear órdenes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order: any) => (
            <Card key={order.id} className="border-border/50 flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {order.publication.scrapingCard.keyword}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {order.publication.content}
                    </p>
                  </div>
                  <Badge variant={order.intent === 'POSITIVE' ? 'outline' : 'destructive'}>
                    {order.intent === 'POSITIVE' ? 'Apoyo (+)' : 'Crítica (-)'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Estado:</span>
                  <span className="font-medium">{order.status}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Comentarios Generados:</span>
                  <span className="font-medium">{order._count.comments}</span>
                </div>
                {order.notes && (
                  <div className="bg-accent/10 p-3 rounded border border-border/50 text-xs text-muted-foreground italic">
                    " {order.notes} "
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
