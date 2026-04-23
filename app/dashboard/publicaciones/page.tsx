import { prisma } from "@/lib/prisma";
import ReviewFeed from "./review-feed";

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ tarjetaId?: string }>;
}) {
  const { tarjetaId } = await searchParams;

  const pendingPublications = await prisma.publication.findMany({
    where: {
      reviewStatus: "PENDING",
      ...(tarjetaId ? { scrapingCardId: tarjetaId } : {}),
    },
    include: {
      scrapingCard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revisión de Publicaciones</h1>
        <p className="text-sm text-muted-foreground">
          {tarjetaId 
            ? "Revisando publicaciones filtradas por tarjeta." 
            : "Aprueba o rechaza los posts encontrados por el scraper."}
        </p>
      </div>
      
      <ReviewFeed initialPublications={pendingPublications} />
    </div>
  );
}
