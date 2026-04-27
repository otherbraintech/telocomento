import { prisma } from "@/lib/prisma";
import ReviewFeed from "./review-feed";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ tarjetaId?: string; keyword?: string }>;
}) {
  const { tarjetaId, keyword } = await searchParams;

  // Si viene un tarjetaId pero no keyword, lo buscamos en BD
  let cardKeyword = keyword;
  if (tarjetaId && !cardKeyword) {
    const card = await prisma.scrapingCard.findUnique({
      where: { id: tarjetaId },
      select: { keyword: true },
    });
    cardKeyword = card?.keyword;
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pendingPublications = await prisma.publication.findMany({
    where: {
      reviewStatus: "PENDING",
      OR: [
        { userId: session.user.id },
        { scrapingCard: { userId: session.user.id } }
      ],
      ...(tarjetaId ? { scrapingCardId: tarjetaId } : {}),
    },
    include: {
      scrapingCard: {
        select: { keyword: true, context: true }
      },
      user: {
        select: { name: true, bio: true }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pendingCount = pendingPublications.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              Revisión de Publicaciones
              {cardKeyword && `: ${cardKeyword}`}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {tarjetaId
              ? `Publicaciones pendientes de la tarjeta "${cardKeyword}".`
              : "Aprueba o rechaza los posts encontrados por el scraper."}
          </p>
        </div>
        
        <div className="text-right">
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary">
            {pendingCount} Pendiente{pendingCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <ReviewFeed 
        key={tarjetaId || "all"} 
        initialPublications={pendingPublications} 
      />
    </div>
  );
}


