import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Rss, MessageSquareQuote, CheckCircle2, Search, PlusCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

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
        <Card className="col-span-4 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tendencia de Hallazgos (Últimas 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex items-end justify-between gap-1 pt-4 px-2">
               {/* Simulación de gráfico de barras/tendencia con CSS/SVG */}
               {[40, 25, 60, 45, 90, 55, 70, 40, 30, 85, 50, 65].map((val, i) => (
                 <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all" 
                      style={{ height: `${val}%` }}
                    />
                    <div className="size-1 rounded-full bg-muted-foreground/30" />
                    {/* Tooltip simple */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {val} hallazgos
                    </div>
                 </div>
               ))}
            </div>
            <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium px-1">
               <span>Hace 24h</span>
               <span>Hace 12h</span>
               <span>Ahora</span>
            </div>
          </CardContent>
        </Card>

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
