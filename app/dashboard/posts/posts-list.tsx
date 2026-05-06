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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

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
  const [postToReject, setPostToReject] = useState<PostWithDetails | null>(null);
  const [postDetailModal, setPostDetailModal] = useState<PostWithDetails | null>(null);

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

  const handleApprove = async (post: PostWithDetails) => {
    try {
      await approvePublication(post.id);
      toast.success("Publicación aprobada");
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, reviewStatus: "APPROVED" } : p
      ));
    } catch (e) {
      toast.error("Error al aprobar");
    }
  };

  const handleConfirmReject = async () => {
    if (!postToReject) return;
    try {
      await rejectPublication(postToReject.id);
      toast.success("Publicación rechazada");
      setPosts(posts.map(p => 
        p.id === postToReject.id ? { ...p, reviewStatus: "REJECTED" } : p
      ));
    } catch (e) {
      toast.error("Error al rechazar");
    }
    setPostToReject(null);
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
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="APPROVED" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Aprobados</TabsTrigger>
          <TabsTrigger value="REJECTED" className="data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all">Rechazados</TabsTrigger>
          <TabsTrigger value="ALL" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white transition-all">Todos</TabsTrigger>
        </TabsList>

        <div className="mt-6 flex flex-col gap-4">
          {filteredPosts.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-background/50 text-muted-foreground">
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
              <Card key={post.id} className="flex flex-col sm:flex-row border-border/50 hover:border-border transition-colors shadow-sm overflow-hidden p-3 gap-4">
                {/* Minutura de la imagen (Izquierda) */}
                <div className="shrink-0 w-full sm:w-32 h-32 bg-muted rounded-md overflow-hidden border border-border/10 relative flex items-center justify-center">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-muted-foreground/40 text-xs font-medium">Sin Imagen</span>
                  )}
                </div>
                
                {/* Detalles (Centro) */}
                <div className="flex flex-col flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] truncate max-w-[150px]">
                      {post.scrapingCard?.keyword || post.user?.name || "Perfil Personal"}
                    </Badge>
                    <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                      <Clock className="w-3 h-3"/> {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary ml-auto">
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                     <div className="size-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                       {post.authorName?.charAt(0) || "F"}
                     </div>
                     <p className="text-xs font-medium truncate">{post.authorName || "Perfil"}</p>
                  </div>
                  
                  <p className="text-sm text-foreground/80 line-clamp-2 mt-1">
                    {post.content || "Sin contenido de texto."}
                  </p>
                </div>

                {/* Acciones (Derecha) */}
                <div className="shrink-0 flex flex-col sm:w-40 gap-2 justify-center border-t sm:border-t-0 sm:border-l border-border/10 pt-3 sm:pt-0 sm:pl-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-[11px] bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-600 hover:text-white"
                    onClick={() => setPostDetailModal(post)}
                  >
                    <Eye className="size-3 mr-1" /> Ver Detalle
                  </Button>

                  {(() => {
                    const activeOrder = post.orders.find(o => o.status !== "CANCELLED");
                    const hasActiveOrder = !!activeOrder;

                    return (
                      <>
                        {hasActiveOrder ? (
                          <Button 
                            asChild
                            variant="outline" 
                            size="sm" 
                            className="w-full h-8 text-[11px] bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-600 hover:text-white"
                          >
                            <Link href={`/dashboard/ordenes/${activeOrder.id}/comentarios`}>
                              <MessageSquarePlus className="size-3 mr-1" /> Ver Orden
                            </Link>
                          </Button>
                        ) : post.reviewStatus === "APPROVED" ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-8 text-[11px] bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white" 
                            onClick={() => setPostToReject(post)}
                          >
                            <X className="size-3 mr-1" /> Rechazar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-8 text-[11px] bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white" 
                            onClick={() => handleApprove(post)}
                          >
                            <Check className="size-3 mr-1" /> Aprobar
                          </Button>
                        )}

                        {post.reviewStatus === "APPROVED" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={hasActiveOrder 
                              ? "w-full h-8 text-[11px] bg-slate-50 text-slate-500 border-slate-200 opacity-70"
                              : "w-full h-8 text-[11px] bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white"
                            }
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
                </div>
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
      <AlertDialog open={!!postToReject} onOpenChange={(open) => !open && setPostToReject(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <AlertDialogTitle className="text-xl font-black">Confirmar Rechazo</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que deseas rechazar esta publicación? Se eliminarán las órdenes asociadas a la misma si las hubiera. Esta acción es difícil de deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="font-bold border-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReject}
              className="bg-red-600 hover:bg-red-700 text-white font-black"
            >
              Sí, rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!postDetailModal} onOpenChange={(open) => !open && setPostDetailModal(null)}>
        <DialogContent className="p-0 border-border/50 max-w-[450px] overflow-hidden">
          {postDetailModal && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="p-4 border-b bg-muted/20 flex justify-between items-start shrink-0">
                <Badge variant="outline" className="text-[10px] max-w-[150px] truncate">
                  {postDetailModal.scrapingCard?.keyword || postDetailModal.user?.name || "Perfil Personal"}
                </Badge>
                <a href={postDetailModal.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="size-4" />
                </a>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {postDetailModal.imageUrl && (
                  <div className="w-full bg-muted border-b border-border/10 flex justify-center">
                    <img 
                      src={postDetailModal.imageUrl} 
                      className="max-w-full max-h-[300px] object-contain" 
                      alt="Publicación" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="size-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                       {postDetailModal.authorName?.charAt(0) || "F"}
                     </div>
                     <div>
                       <p className="text-sm font-semibold">{postDetailModal.authorName || "Perfil"}</p>
                       <p className="text-[10px] text-muted-foreground">
                         {new Date(postDetailModal.publishedAt).toLocaleDateString()}
                       </p>
                     </div>
                  </div>
                  <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {postDetailModal.content || "Sin contenido de texto."}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t bg-muted/5 flex gap-2 shrink-0 justify-end">
                <Button variant="outline" onClick={() => setPostDetailModal(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
