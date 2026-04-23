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
        <h1 className="text-2xl font-bold tracking-tight text-white">Órdenes y Comentarios</h1>
        <p className="text-sm text-zinc-400">Seguimiento de las órdenes enviadas a la IA y estado de los bots.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-zinc-950 border-zinc-800 border-dashed text-zinc-400">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <p>No tienes ninguna orden generada.</p>
            <p className="text-sm mt-2">Ve a la sección de Publicaciones para aprobar contenido y crear órdenes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.id} className="bg-zinc-950 border-zinc-800 text-white flex flex-col">
              <CardHeader className="pb-3 border-b border-zinc-900">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {order.publication.scrapingCard.keyword}
                    </CardTitle>
                    <p className="text-xs text-zinc-500 line-clamp-1 mt-1">
                      {order.publication.content}
                    </p>
                  </div>
                  <Badge className={order.intent === 'POSITIVE' ? 'bg-green-950 text-green-400 border-green-900' : 'bg-red-950 text-red-400 border-red-900'}>
                    {order.intent === 'POSITIVE' ? 'Apoyo (+)' : 'Crítica (-)'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">Estado:</span>
                  <span className="font-medium text-white">{order.status}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-zinc-500">Comentarios Generados:</span>
                  <span className="font-medium text-white">{order._count.comments}</span>
                </div>
                {order.notes && (
                  <div className="bg-zinc-900 p-3 rounded text-xs text-zinc-400 italic">
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
