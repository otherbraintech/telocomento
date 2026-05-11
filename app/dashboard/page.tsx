import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Rss, MessageSquareQuote, CheckCircle2, Search, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { FindingTrendChart } from "@/components/finding-trend-chart";

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

  // Obtener actividad reciente real
  const recentActivities = await prisma.publication.findMany({
    where: {
      OR: [
        { userId: session?.user?.id },
        { scrapingCard: { userId: session?.user?.id } }
      ]
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      scrapingCard: { select: { keyword: true } }
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      cardLimit: true,
      orderLimit: true,
      _count: {
        select: {
          orders: { where: { status: { notIn: ["CANCELLED", "COMPLETED"] } } }
        }
      }
    }
  });

  const cardLimit = user?.cardLimit || 10;
  const orderLimit = user?.orderLimit || 0;
  const userActiveOrders = user?._count.orders || 0;

  const cardProgress = Math.min(100, (userCardsCount / cardLimit) * 100);
  const orderProgress = orderLimit > 0 ? Math.min(100, (userActiveOrders / orderLimit) * 100) : 0;

  // Datos para el gráfico comparativo (últimos 7 días)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  last7Days.setHours(0, 0, 0, 0);

  // Consultas paralelas para el gráfico
  const [dailyPubs, dailyOrders, dailyComments] = await Promise.all([
    prisma.publication.findMany({
      where: {
        createdAt: { gte: last7Days },
        OR: [
          { userId: session?.user?.id },
          { scrapingCard: { userId: session?.user?.id } }
        ]
      },
      select: { createdAt: true }
    }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: last7Days },
        userId: session?.user?.id
      },
      select: { createdAt: true }
    }),
    prisma.comment.findMany({
      where: {
        createdAt: { gte: last7Days },
        order: { userId: session?.user?.id }
      },
      select: { createdAt: true }
    })
  ]);

  // Agrupar todo por día
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    
    const pubsCount = dailyPubs.filter(f => {
      const d = new Date(f.createdAt);
      d.setHours(0,0,0,0);
      return d.getTime() === date.getTime();
    }).length;

    const ordersCount = dailyOrders.filter(f => {
      const d = new Date(f.createdAt);
      d.setHours(0,0,0,0);
      return d.getTime() === date.getTime();
    }).length;

    const commentsCount = dailyComments.filter(f => {
      const d = new Date(f.createdAt);
      d.setHours(0,0,0,0);
      return d.getTime() === date.getTime();
    }).length;
    
    return { 
      date: dateStr, 
      publicaciones: pubsCount,
      ordenes: ordersCount,
      comentarios: commentsCount
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido a TeloComento, {session?.user?.name?.split(" ")[0] || "Usuario"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Panel de control y resumen de actividad.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/dashboard/publicaciones" className="group">
          <Card className="h-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer overflow-hidden relative group">
            <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
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
                Ver hallazgos <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tarjetas" className="group">
          <Card className="h-full border-border/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden relative">
            <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
              <PlusCircle className="size-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="size-5" />
                Mis Tarjetas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configura nuevas palabras clave y contextos para que el sistema busque en Facebook por ti.
              </p>
              <div className="flex items-center text-sm font-bold gap-1 text-foreground/80">
                Gestionar tarjetas <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:bg-accent/5 transition-colors shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarjetas Usadas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{userCardsCount} / {cardLimit}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {activeCardsCount} tarjetas activas
              </p>
            </div>
            <Progress value={cardProgress} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/5 transition-colors shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
            <MessageSquareQuote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{userActiveOrders} / {orderLimit}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {orderLimit - userActiveOrders} órdenes libres
              </p>
            </div>
            <Progress value={orderProgress} className="h-1.5" />
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
        <FindingTrendChart data={chartData} />

        <Card className="col-span-3 shadow-sm border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-8">
                  No hay actividad reciente para mostrar.
                </p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm border-l-2 border-primary/20 pl-3 py-1 hover:border-primary transition-colors">
                    <div className="flex-1">
                      <p className="font-medium leading-none mb-1">
                        Nuevo post encontrado
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Tarjeta: <span className="font-semibold text-foreground">{activity.scrapingCard?.keyword}</span>
                      </p>
                    </div>
                    <time className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-border/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Scraper Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Funcionando normalmente. Último escaneo hace 4 min.</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              Bots Cluster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">12 instancias activas en la red de dispositivos.</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              AI Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Llamadas a OpenRouter exitosas (Latencia: 1.2s).</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
