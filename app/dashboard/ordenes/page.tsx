import { prisma } from "@/lib/prisma";
import OrdersList from "./orders-list";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function OrdenesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      publication: {
        include: { 
          scrapingCard: true,
          user: {
            select: { name: true }
          }
        }
      },
      _count: { select: { comments: true } }
    }
  });

  // Calcular conteo de comentarios publicados para cada orden
  const ordersWithPublished = await Promise.all(
    orders.map(async (order) => {
      const publishedCount = await prisma.comment.count({
        where: {
          orderId: order.id,
          status: "PUBLISHED",
        },
      });
      return {
        ...order,
        publishedCount,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Órdenes</h1>
        <p className="text-sm text-muted-foreground">Administra las órdenes de comentarios para tus publicaciones aprobadas.</p>
      </div>

      <OrdersList initialOrders={ordersWithPublished} />
    </div>
  );
}
