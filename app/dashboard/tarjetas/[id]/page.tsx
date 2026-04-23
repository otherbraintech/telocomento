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
  params: { id: string }
}) {
  const tarjeta = await prisma.scrapingCard.findUnique({
    where: { id: params.id },
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
    await prisma.scrapingCard.delete({ where: { id: params.id } });
    revalidatePath("/dashboard/tarjetas");
    redirect("/dashboard/tarjetas");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Link href="/dashboard/tarjetas">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{tarjeta.keyword}</h1>
            <p className="text-sm text-zinc-400">Detalle de la tarjeta de monitoreo</p>
          </div>
        </div>

        <form action={deleteTarjeta}>
          <Button variant="destructive" type="submit" className="bg-red-950/50 text-red-500 hover:bg-red-900 hover:text-white border border-red-900">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Tarjeta
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-950 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Causa / Tema</p>
              <p className="font-medium">{tarjeta.topic}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Estado</p>
              <Badge className={tarjeta.status === 'ACTIVE' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}>
                {tarjeta.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Fuentes Monitoreadas</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {tarjeta.sources.map((source: any, idx: number) => (
                  <Badge key={idx} variant="outline" className="border-zinc-800 bg-zinc-900">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800 text-white flex flex-col">
          <CardHeader>
            <CardTitle>Últimas Publicaciones</CardTitle>
            <CardDescription className="text-zinc-400">Recientes hallazgos de esta tarjeta.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {tarjeta.publications.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No hay publicaciones aún.</p>
            ) : (
              <div className="space-y-3">
                {tarjeta.publications.map(pub => (
                  <div key={pub.id} className="p-3 border border-zinc-800 rounded-md bg-zinc-900">
                    <div className="flex justify-between mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold
                        ${pub.reviewStatus === 'APPROVED' ? 'bg-green-950 text-green-400' : 
                          pub.reviewStatus === 'REJECTED' ? 'bg-red-950 text-red-400' : 
                          'bg-yellow-950 text-yellow-400'}`}>
                        {pub.reviewStatus}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {pub.publishedAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-2">
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
