import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import PostsList from "./posts-list";
import { CreatePublicationDialog } from "./create-publication-dialog";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PostsGestionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reviewedPublications = await prisma.publication.findMany({
    where: {
      reviewStatus: {
        in: ["APPROVED", "REJECTED"]
      },
      OR: [
        { userId: session.user.id },
        { scrapingCard: { userId: session.user.id } }
      ]
    },
    include: {
      scrapingCard: true,
      user: { select: { name: true } },
      orders: {
        select: { id: true, status: true }
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los posts aprobados o rechazados y crea órdenes para la IA.
          </p>
        </div>
        <CreatePublicationDialog />
      </div>

      <PostsList initialPosts={reviewedPublications} />
    </div>
  );
}
