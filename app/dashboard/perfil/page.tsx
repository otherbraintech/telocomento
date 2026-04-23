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
      _count: { select: { scrapingCards: true } }
    }
  });

  const currentCount = user?._count.scrapingCards || 0;
  const limit = user?.cardLimit || 0;
  const percentage = Math.min(100, (currentCount / limit) * 100);

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
              Resumen de tu cuota de tarjetas permitidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tarjetas de Monitoreo</Label>
                <span className="text-sm font-medium">{currentCount} / {limit}</span>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-[10px] text-muted-foreground italic text-right">
                {limit - currentCount} espacios disponibles
              </p>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}
