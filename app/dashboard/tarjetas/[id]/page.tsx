import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function DetalleTarjetaPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const tarjeta = await prisma.scrapingCard.findUnique({
    where: { id },
    include: {
      publications: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!tarjeta) {
    redirect("/dashboard/tarjetas");
  }

  // Server action to delete
  const deleteTarjeta = async () => {
    "use server";
    await prisma.scrapingCard.delete({ where: { id } });
    revalidatePath("/dashboard/tarjetas");
    redirect("/dashboard/tarjetas");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/tarjetas">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{tarjeta.keyword}</h1>
            <p className="text-sm text-muted-foreground">Detalle de la tarjeta de monitoreo</p>
          </div>
        </div>

        <form action={deleteTarjeta}>
          <Button variant="destructive" type="submit">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Tarjeta
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Palabra Clave / Keyword</p>
              <p className="font-medium">{tarjeta.keyword}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Contexto</p>
              <p className="text-sm text-muted-foreground">{tarjeta.context || "Sin contexto adicional"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              <Badge variant={tarjeta.status === 'ACTIVE' ? 'outline' : 'destructive'}>
                {tarjeta.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 flex flex-col">
          <CardHeader>
            <CardTitle>Últimas Publicaciones</CardTitle>
            <CardDescription>Recientes hallazgos de esta tarjeta.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {tarjeta.publications.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay publicaciones aún.</p>
            ) : (
              <div className="space-y-3">
                {tarjeta.publications.map((pub: any) => (
                  <div key={pub.id} className="p-3 border border-border/50 rounded-md bg-accent/5">
                    <div className="flex justify-between mb-1">
                      <Badge variant={
                        pub.reviewStatus === 'APPROVED' ? 'default' : 
                        pub.reviewStatus === 'REJECTED' ? 'destructive' : 
                        'secondary'
                      } className="text-[10px]">
                        {pub.reviewStatus}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {pub.publishedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                      {pub.content || "Sin contenido"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
