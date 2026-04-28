import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Rss, MessageSquareQuote, CheckCircle2, Search, PlusCircle, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  const userCardsCount = await prisma.scrapingCard.count({
    where: { userId: session?.user?.id }
  });



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

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { cardLimit: true }
  });

  const cardLimit = user?.cardLimit || 10;

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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/publicaciones" className="group">
          <Card className="h-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Search className="size-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Search className="size-5" />
                Explorar Publicaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Revisa los últimos hallazgos del scraper y aprueba publicaciones para generar comentarios.
              </p>
              <div className="flex items-center text-sm font-bold text-primary gap-1">
                Ver hallazgos <ArrowRight className="size-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tarjetas/nueva" className="group">
          <Card className="h-full border-border/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <PlusCircle className="size-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="size-5" />
                Nueva Tarjeta de Monitoreo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configura nuevas palabras clave y contextos para que el sistema busque en Facebook por ti.
              </p>
              <div className="flex items-center text-sm font-bold gap-1 text-foreground/80">
                Crear tarjeta <ArrowRight className="size-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-accent/5 transition-colors shadow-none border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuota de Tarjetas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCardsCount} / {cardLimit}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeCardsCount} tarjetas activas actualmente
            </p>
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
