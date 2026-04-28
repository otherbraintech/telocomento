"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, X, PlusCircle, MessageSquarePlus, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { approvePublication, rejectPublication, createOrderFromPublication } from "@/lib/actions/publications";
import { toast } from "sonner";

import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PostWithDetails = {
  id: string;
  sourceUrl: string;
  imageUrl: string;
  authorName: string | null;
  content: string | null;
  publishedAt: Date;
  reviewStatus: "APPROVED" | "REJECTED";
  scrapingCard?: {
    keyword: string;
  } | null;
  user?: {
    name: string | null;
  } | null;
  orders: { id: string; status: string }[];
};

export default function PostsList({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [filter, setFilter] = useState<string>("APPROVED"); // Por defecto ver aprobados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [intent, setIntent] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [notes, setNotes] = useState("");

  // Filtrar y Ordenar: Aprobados primero
  const filteredPosts = posts
    .filter(p => filter === "ALL" ? true : p.reviewStatus === filter)
    .sort((a, b) => {
      // Si estamos en vista "ALL", poner APPROVED primero
      if (filter === "ALL") {
        if (a.reviewStatus === "APPROVED" && b.reviewStatus === "REJECTED") return -1;
        if (a.reviewStatus === "REJECTED" && b.reviewStatus === "APPROVED") return 1;
      }
      return 0; // Mantener orden original (por fecha desde el servidor)
    });

  const handleStatusToggle = async (post: PostWithDetails) => {
    try {
      if (post.reviewStatus === "APPROVED") {
        await rejectPublication(post.id);
        toast.success("Publicación rechazada");
      } else {
        await approvePublication(post.id);
        toast.success("Publicación aprobada");
      }
      // Actualizar estado local
      setPosts(posts.map(p => 
        p.id === post.id 
          ? { ...p, reviewStatus: p.reviewStatus === "APPROVED" ? "REJECTED" : "APPROVED" } 
          : p
      ));
    } catch (e) {
      toast.error("Error al actualizar estado");
    }
  };

  const openOrderModal = (post: PostWithDetails) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const submitOrder = async () => {
    if (!selectedPost) return;
    const toastId = toast.loading("Creando orden y generando comentarios con IA...");
    try {
      const orderId = await createOrderFromPublication(selectedPost.id, intent, notes);
      toast.success("Orden creada correctamente", { id: toastId });
      setIsModalOpen(false);
      setNotes("");
      // Marcar que este post ya tiene una orden con el ID real
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, orders: [{ id: orderId, status: "GENERATED" }] } 
          : p
      ));
    } catch (e) {
      toast.error("Error al crear la orden", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="APPROVED" className="w-full" onValueChange={setFilter}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 bg-muted/50">
          <TabsTrigger value="APPROVED" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Aprobados</TabsTrigger>
          <TabsTrigger value="REJECTED" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">Rechazados</TabsTrigger>
          <TabsTrigger value="ALL">Todos</TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length === 0 ? (
            <Card className="col-span-full border-dashed border-border/50 bg-background/50 text-muted-foreground">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Clock className="size-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {filter === "APPROVED" ? "No hay posts aprobados" : 
                   filter === "REJECTED" ? "No hay posts rechazados" : 
                   "No hay posts revisados"}
                </h3>
                <p className="mb-6 max-w-sm">
                  {filter === "APPROVED" ? "Aún no has aprobado ninguna publicación desde la sección de explorar." :
                   filter === "REJECTED" ? "No has rechazado ninguna publicación recientemente." :
                   "Aún no has revisado ninguna publicación."}
                </p>
                <Button asChild variant="outline">
                  <Link href="/dashboard/publicaciones">Ir a Explorar Posts</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="flex flex-col border-border/50 hover:border-border transition-colors shadow-sm overflow-hidden">
                {/* ... resto del contenido de la tarjeta ... */}
                <CardHeader className="p-4 border-b bg-muted/20">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="text-[10px] truncate max-w-[150px]">
                      {post.scrapingCard?.keyword || post.user?.name || "Perfil Personal"}
                    </Badge>
                    <div className="flex gap-2">
                      <Badge className={post.reviewStatus === "APPROVED" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                        {post.reviewStatus === "APPROVED" ? "Aprobado" : "Rechazado"}
                      </Badge>
                      <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="size-4" />
                      </a>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col flex-1">
                  {post.imageUrl && (
                    <div className="w-full aspect-video bg-muted overflow-hidden border-b border-border/10">
                      <img src={post.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="size-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                         {post.authorName?.charAt(0) || "F"}
                       </div>
                       <p className="text-xs font-medium truncate">{post.authorName || "Perfil"}</p>
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-3">
                      {post.content || "Sin contenido de texto."}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-3 border-t bg-muted/5 flex gap-2">
                  {(() => {
                    const activeOrder = post.orders.find(o => o.status !== "CANCELLED");
                    const hasActiveOrder = !!activeOrder;

                    return (
                      <>
                        {hasActiveOrder ? (
                          <Button 
                            asChild
                            variant="default" 
                            size="sm" 
                            className="flex-1 h-8 text-[11px]"
                          >
                            <Link href={`/dashboard/ordenes/${activeOrder.id}/comentarios`}>
                              <Eye className="size-3 mr-1" /> Ver Orden
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-8 text-[11px]" 
                            onClick={() => handleStatusToggle(post)}
                          >
                            {post.reviewStatus === "APPROVED" ? (
                              <><X className="size-3 mr-1" /> Rechazar</>
                            ) : (
                              <><Check className="size-3 mr-1" /> Aprobar</>
                            )}
                          </Button>
                        )}

                        {post.reviewStatus === "APPROVED" && (
                          <Button 
                            variant={hasActiveOrder ? "ghost" : "default"} 
                            size="sm" 
                            className="flex-1 h-8 text-[11px]"
                            disabled={hasActiveOrder}
                            onClick={() => openOrderModal(post)}
                          >
                            {hasActiveOrder ? (
                              <><Clock className="size-3 mr-1" /> Orden Lista</>
                            ) : (
                              <><MessageSquarePlus className="size-3 mr-1" /> Crear Orden</>
                            )}
                          </Button>
                        )}
                      </>
                    );
                  })()}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-border/50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Orden para Post</DialogTitle>
            <DialogDescription>
              Configura cómo debe responder la IA a esta publicación aprobada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="intent">Objetivo de los bots</Label>
              <Select value={intent} onValueChange={(v: "POSITIVE" | "NEGATIVE") => setIntent(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la intención" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITIVE">Apoyar (+)</SelectItem>
                  <SelectItem value="NEGATIVE">Criticar / Atacar (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Instrucciones para la IA (Opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ej. Mencionar que esto es una excelente iniciativa..."
                className="resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={submitOrder} disabled={isPending}>
              {isPending ? "Generando..." : "Confirmar Orden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
