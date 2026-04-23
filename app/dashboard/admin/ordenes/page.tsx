import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdenesPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      publication: true,
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Intención</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Comentarios</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-mono text-[10px]">{order.id}</td>
                    <td className="p-4 align-middle">{order.user.name}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={order.intent === "POSITIVE" ? "default" : "destructive"}>
                        {order.intent}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">{order._count.comments}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{order.status}</Badge>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
