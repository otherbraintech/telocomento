import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TarjetaStatusToggle } from "@/components/tarjeta-status-toggle";
import { CardActions } from "@/components/card-actions";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function AdminTarjetasPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const allTarjetas = await prisma.scrapingCard.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, username: true, email: true }
      },
      _count: {
        select: { publications: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Administración Global de Tarjetas</h1>
        <p className="text-sm text-muted-foreground">
          Visualiza y gestiona todas las tarjetas de monitoreo de todos los usuarios del sistema.
        </p>
      </div>

      <div className="grid gap-4">
        {allTarjetas.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No hay tarjetas registradas en el sistema.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allTarjetas.map((tarjeta) => (
              <Card key={tarjeta.id} className="border-border/50 shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      ID: {tarjeta.id.slice(-6)}
                    </Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <TarjetaStatusToggle cardId={tarjeta.id} status={tarjeta.status} />
                      <CardActions card={tarjeta} />
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold truncate">
                    {tarjeta.keyword}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-accent/30 border border-border/30">
                    <User className="size-3 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold leading-tight truncate">
                            {tarjeta.user.name || "Usuario sin nombre"}
                        </span>
                        <span className="text-[9px] text-muted-foreground leading-tight truncate">
                            @{tarjeta.user.username || "sin-username"}
                        </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">Contexto:</p>
                    <p className="text-xs line-clamp-3 bg-muted/30 p-2 rounded border border-border/10 italic">
                      {tarjeta.context || "Sin contexto adicional proporcionado."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="text-center flex-1 border-r border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase">Posts</p>
                        <p className="font-bold text-sm">{tarjeta._count.publications}</p>
                    </div>
                    <div className="text-center flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Fecha</p>
                        <p className="font-bold text-[11px]">
                            {new Date(tarjeta.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
