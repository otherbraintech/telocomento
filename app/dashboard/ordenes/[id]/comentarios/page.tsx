import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import CommentsList from "./comments-list";

export default async function ComentariosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      publication: {
        include: { scrapingCard: true },
      },
      comments: {
        include: { device: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <CommentsList order={order} />
    </div>
  );
}
