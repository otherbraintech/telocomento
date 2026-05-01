import { prisma } from "@/lib/prisma";
import ReviewFeed from "./review-feed";
import { ReviewToolbar } from "./review-toolbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ tarjetaId?: string; keyword?: string; desde?: string }>;
}) {
  const { tarjetaId, keyword, desde } = await searchParams;

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

  // Construir filtro de fecha si viene "desde"
  const dateFilter = desde
    ? { createdAt: { gte: new Date(desde) } }
    : {};

  const pendingPublications = await prisma.publication.findMany({
    where: {
      reviewStatus: "PENDING",
      OR: [
        { userId: session.user.id },
        { scrapingCard: { userId: session.user.id } }
      ],
      ...(tarjetaId ? { scrapingCardId: tarjetaId } : {}),
      ...dateFilter,
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
      <div className="flex flex-col gap-4 border-b pb-4">
        {/* Título y descripción */}
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

        {/* Controles: Badge + Filtro de fecha + Toggle de vista */}
        <ReviewToolbar
          pendingCount={pendingCount}
          currentDesde={desde}
          tarjetaId={tarjetaId}
          keyword={keyword}
        />
      </div>

      <ReviewFeed
        key={`${tarjetaId || "all"}-${desde || "none"}`}
        initialPublications={pendingPublications}
      />
    </div>
  );
}

