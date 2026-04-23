import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default async function AdminPublicacionesPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const publications = await prisma.publication.findMany({
    include: {
      scrapingCard: {
        include: { user: true }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administración Global: Publicaciones</h1>
        <p className="text-sm text-muted-foreground">Vista maestra de todos los hallazgos de todos los usuarios.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Historial Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Keyword</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Autor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Contenido</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Link</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {publications.map((pub: any) => (
                  <tr key={pub.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{pub.scrapingCard.user.name}</td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{pub.scrapingCard.keyword}</Badge>
                    </td>
                    <td className="p-4 align-middle">{pub.authorName}</td>
                    <td className="p-4 align-middle max-w-[200px] truncate">{pub.content}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={pub.reviewStatus === "APPROVED" ? "default" : pub.reviewStatus === "REJECTED" ? "destructive" : "secondary"}>
                        {pub.reviewStatus}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <a href={pub.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
