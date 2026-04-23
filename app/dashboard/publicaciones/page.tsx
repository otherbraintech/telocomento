import { prisma } from "@/lib/prisma";
import ReviewFeed from "./review-feed";

export default async function PublicacionesPage() {
  const pendingPublications = await prisma.publication.findMany({
    where: {
      reviewStatus: "PENDING",
    },
    include: {
      scrapingCard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Revisión de Publicaciones</h1>
        <p className="text-sm text-zinc-400">Aprueba o rechaza los posts encontrados por el scraper.</p>
      </div>
      
      <ReviewFeed initialPublications={pendingPublications} />
    </div>
  );
}
