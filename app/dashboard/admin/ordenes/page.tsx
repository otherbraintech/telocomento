import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderAdminActions } from "@/components/admin/order-admin-actions";
import { ExternalLink, User, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const intentMap: Record<string, { label: string; className: string }> = {
  POSITIVE: { label: "Apoyo", className: "bg-green-500/10 text-green-600 border-green-200" },
  NEGATIVE: { label: "Crítica", className: "bg-red-500/10 text-red-600 border-red-200" },
};

const statusMap: Record<string, string> = {
  DRAFT: "Borrador",
  GENERATED: "Generado",
  ACTIVATED: "Activado",
  IN_PROGRESS: "En Progreso",
  STOPPED: "Detenido",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  ERROR: "Error",
};

export default async function AdminOrdenesPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      publication: {
        include: { scrapingCard: true }
      },
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administración Global: Órdenes</h1>
        <p className="text-sm text-muted-foreground">Monitoreo de todas las órdenes de bots generadas en el sistema.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Historial de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">#</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Publicación / Autor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario Cliente</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Intención</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Comentarios</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {orders.map((order: any, index: number) => {
                  const intent = intentMap[order.intent] || { label: order.intent, className: "" };
                  const statusLabel = statusMap[order.status] || order.status;
                  
                  return (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-bold text-muted-foreground">{index + 1}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {order.publication.authorName || "Anónimo"}
                            </span>
                            <a 
                              href={order.publication.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">
                            {order.publication.scrapingCard?.keyword ? `Keyword: ${order.publication.scrapingCard.keyword}` : "Manual"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <User className="size-3 text-muted-foreground" />
                          <span>{order.user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="outline" className={intent.className}>
                          {intent.label}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MessageSquare className="size-3 text-muted-foreground" />
                          {order._count.comments}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="secondary" className="font-medium">
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild className="h-8 px-2 gap-1 text-[10px] uppercase font-bold">
                            <Link href={`/dashboard/ordenes/${order.id}/comentarios`}>
                              Ver Orden
                            </Link>
                          </Button>
                          <OrderAdminActions order={order} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
