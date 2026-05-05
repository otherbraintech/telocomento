import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CreditCard, 
  Rss, 
  MessageSquareQuote, 
  Smartphone, 
  Zap, 
  Bot,
  ArrowRight,
  AlertTriangle,
  ShoppingBag
} from "lucide-react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AyudaPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cardLimit: true,
      _count: {
        select: {
          scrapingCards: true,
          publications: { where: { reviewStatus: "PENDING" } }
        }
      }
    }
  });

  const cardsCount = user?._count.scrapingCards || 0;
  const cardLimit = user?.cardLimit || 0;
  const pendingPubs = user?._count.publications || 0;
  const hasNoMoreCards = cardsCount >= cardLimit;

  const steps = [
    {
      title: "1. Crea tu Tarjeta de Monitoreo",
      description: "Define palabras clave y el contexto que el scraper debe buscar en redes sociales.",
      icon: <CreditCard className="size-6 text-blue-500" />,
      link: "/dashboard/tarjetas",
      status: hasNoMoreCards ? "Completado / Límite alcanzado" : "Pendiente"
    },
    {
      title: "2. Modera los Hallazgos",
      description: "Revisa las publicaciones encontradas. Aprueba las que te interesen y rechaza las demás.",
      icon: <Rss className="size-6 text-orange-500" />,
      link: "/dashboard/publicaciones",
      status: pendingPubs > 0 ? `${pendingPubs} pendientes` : "Sin contenido nuevo"
    },
    {
      title: "3. Gestiona tus Órdenes",
      description: "Crea una orden para las publicaciones aprobadas, definiendo el tono y la intención de los comentarios.",
      icon: <MessageSquareQuote className="size-6 text-green-500" />,
      link: "/dashboard/ordenes"
    },
    {
      title: "4. Sincroniza tus Bots",
      description: "Asegúrate de tener dispositivos activos y vinculados para que puedan ejecutar los comentarios.",
      icon: <Smartphone className="size-6 text-purple-500" />,
      link: "/dashboard/dispositivos"
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">¿Cómo funciona TeloComento?</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Sigue estos pasos para automatizar tu presencia y respuesta en redes sociales de manera inteligente.
        </p>
      </div>

      {/* Resumen de Estado */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-background/40 border-border/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Capacidad de Monitoreo</CardDescription>
            <CardTitle className="text-2xl">{cardsCount} / {cardLimit}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">Tarjetas activas vs límite contratado.</p>
          </CardContent>
        </Card>
        <Card className="bg-background/40 border-border/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-orange-500">Moderación Pendiente</CardDescription>
            <CardTitle className="text-2xl">{pendingPubs}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">Publicaciones esperando ser aprobadas.</p>
          </CardContent>
        </Card>
        <Card className="bg-background/40 border-border/40">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-green-500">Bots Listos</CardDescription>
            <CardTitle className="text-2xl">Activo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">Sistema de respuesta sincronizado.</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Dinámicas */}
      <div className="space-y-4">
        {hasNoMoreCards && pendingPubs === 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5 backdrop-blur-md">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-3 bg-amber-500/20 rounded-full">
                <AlertTriangle className="size-6 text-amber-500 shrink-0" />
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">¡Capacidad Máxima Alcanzada!</p>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Has utilizado todas tus tarjetas de monitoreo ({cardsCount}/{cardLimit}) y no hay más publicaciones para moderar. 
                  Para seguir extrayendo datos, necesitas ampliar tu límite de tarjetas.
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5" asChild>
                    <Link href="/dashboard/perfil">
                      <ShoppingBag className="size-3.5" />
                      Aumentar mi capacidad (Tokens / Límite)
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {hasNoMoreCards && pendingPubs > 0 && (
          <Card className="border-blue-500/50 bg-blue-500/5">
            <CardContent className="p-4 flex items-start gap-4">
              <Zap className="size-5 text-blue-500 mt-1 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Siguiente paso sugerido: Moderación</p>
                <p className="text-xs text-muted-foreground">
                  Has alcanzado tu límite de tarjetas, pero tienes <strong>{pendingPubs} publicaciones</strong> esperando tu revisión. 
                  Ve al Paso 2 para empezar a crear órdenes.
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1.5" asChild>
                    <Link href="/dashboard/publicaciones">
                      <Rss className="size-3" />
                      Ir a Moderación
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step, i) => (
          <Card key={i} className="group hover:shadow-md transition-all border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-muted/50 rounded-xl group-hover:bg-muted transition-colors">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </div>
                </div>
                {step.status && (
                  <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {step.status}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              <div className="pt-2">
                <Link 
                  href={step.link} 
                  className="inline-flex items-center text-sm font-semibold text-primary hover:gap-2 transition-all gap-1.5"
                >
                  Ir a esta sección <ArrowRight className="size-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-primary fill-primary/20" />
            <CardTitle>Consejos Pro</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-4 md:grid-cols-2">
            <li className="flex gap-3">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">01</span>
              </div>
              <p className="text-sm">
                <strong>Usa contextos detallados:</strong> Cuanta más información des en la tarjeta de monitoreo, más precisos serán los resultados del scraper.
              </p>
            </li>
            <li className="flex gap-3">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">02</span>
              </div>
              <p className="text-sm">
                <strong>Atajos de teclado:</strong> En la revisión de posts, usa las flechas para aprobar o rechazar tarjetas rápidamente.
              </p>
            </li>
            <li className="flex gap-3">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">03</span>
              </div>
              <p className="text-sm">
                <strong>Tono de Voz:</strong> Configura tu tono preferido en "Mi Perfil" para que los bots hablen como tú quieras.
              </p>
            </li>
            <li className="flex gap-3">
              <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">04</span>
              </div>
              <p className="text-sm">
                <strong>Historial:</strong> Revisa el log de ejecución en tus órdenes para ver qué bot publicó cada comentario y cuándo.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-3 px-6 py-3 bg-muted/30 rounded-full border border-border/50">
          <Bot className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">¿Necesitas soporte técnico? Contacta con tu administrador.</span>
        </div>
      </div>
    </div>
  )
}
