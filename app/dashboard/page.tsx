import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Rss, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  const userCardsCount = await prisma.scrapingCard.count({
    where: { userId: session?.user?.id }
  });

  if (userCardsCount === 0) {
    redirect("/dashboard/tarjetas/nueva");
  }

  const activeCardsCount = await prisma.scrapingCard.count({
    where: { 
      userId: session?.user?.id,
      status: "ACTIVE" 
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const publicationsToday = await prisma.publication.count({
    where: {
      createdAt: { gte: today }
    }
  });

  const ordersCount = await prisma.order.count();

  const commentsActivatedCount = await prisma.comment.count({
    where: { status: "PUBLISHED" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {session?.user?.name || "Administrador"}
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus tarjetas de monitoreo, publicaciones y órdenes de bots.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-accent/5 transition-colors shadow-none border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarjetas Activas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCardsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Monitoreos en curso</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/5 transition-colors shadow-none border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publicaciones Hoy</CardTitle>
            <Rss className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicationsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Nuevos hallazgos</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/5 transition-colors shadow-none border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Generadas</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Órdenes totales</p>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/5 transition-colors shadow-none border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentarios Activados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commentsActivatedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Acciones publicadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-none border-border/50">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <p className="text-sm text-muted-foreground italic text-center py-8">
                Próximamente: Gráfico de actividad y últimos logs de bots.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-none border-border/50">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Scraper Status</span>
                  <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-500/10 rounded">ONLINE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bots Cluster</span>
                  <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-500/10 rounded">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Service (OpenRouter)</span>
                  <span className="text-xs font-bold text-green-500 px-2 py-1 bg-green-500/10 rounded">READY</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
