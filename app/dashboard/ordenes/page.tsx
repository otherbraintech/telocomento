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
        include: { scrapingCard: true }
      },
      comments: true,
      _count: { select: { comments: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Órdenes</h1>
        <p className="text-sm text-muted-foreground">Administra las órdenes de comentarios para tus publicaciones aprobadas.</p>
      </div>

      <OrdersList initialOrders={orders} />
    </div>
  );
}
