import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ProfileForm } from "@/components/profile-form";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: {
        scrapingCards: true,
        orders: true
      } }
    }
  });

  const currentCards = user?._count.scrapingCards || 0;
  const cardLimit = user?.cardLimit || 0;
  const cardPercentage = cardLimit > 0 ? Math.min(100, (currentCards / cardLimit) * 100) : 0;

  const currentOrders = user?._count.orders || 0;
  const orderLimit = user?.orderLimit || 0;
  const orderPercentage = orderLimit > 0 ? Math.min(100, (currentOrders / orderLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu información personal y capacidad de monitoreo.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileForm user={user} />

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Capacidad de Monitoreo</CardTitle>
            <CardDescription>
              Resumen de tus cuotas de tarjetas y órdenes permitidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tarjetas de Monitoreo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tarjetas de Monitoreo</Label>
                <span className="text-sm font-medium">{currentCards} / {cardLimit}</span>
              </div>
              <Progress value={cardPercentage} className="h-2" />
              <p className="text-[10px] text-muted-foreground italic text-right">
                {cardLimit - currentCards} espacios disponibles
              </p>
            </div>

            {/* Órdenes Creadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Órdenes Creadas</Label>
                <span className="text-sm font-medium">{currentOrders} / {orderLimit}</span>
              </div>
              <Progress value={orderPercentage} className="h-2" />
              <p className="text-[10px] text-muted-foreground italic text-right">
                {orderLimit - currentOrders} órdenes disponibles
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
