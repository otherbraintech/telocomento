"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, X, PlusCircle, MessageSquarePlus, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { approvePublication, rejectPublication, createOrderFromPublication } from "@/lib/actions/publications";
import { toast } from "sonner";

type PostWithDetails = {
  id: string;
  sourceUrl: string;
  imageUrl: string;
  authorName: string | null;
  content: string | null;
  publishedAt: Date;
  reviewStatus: "APPROVED" | "REJECTED";
  scrapingCard: {
    keyword: string;
  };
  orders: { id: string; status: string }[];
};

export default function PostsList({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [intent, setIntent] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [notes, setNotes] = useState("");

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
    setIsPending(true);
    try {
      await createOrderFromPublication(selectedPost.id, intent, notes);
      toast.success("Orden creada correctamente");
      setIsModalOpen(false);
      setNotes("");
      // Marcar que este post ya tiene una orden
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, orders: [{ id: "new", status: "GENERATED" }] } 
          : p
      ));
    } catch (e) {
      toast.error("Error al crear la orden");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col border-border/50 hover:border-border transition-colors shadow-sm overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/20">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="text-[10px] truncate max-w-[150px]">
                {post.scrapingCard.keyword}
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

            {post.reviewStatus === "APPROVED" && (
              <Button 
                variant={post.orders.length > 0 ? "ghost" : "default"} 
                size="sm" 
                className="flex-1 h-8 text-[11px]"
                disabled={post.orders.length > 0}
                onClick={() => openOrderModal(post)}
              >
                {post.orders.length > 0 ? (
                  <><Clock className="size-3 mr-1" /> Orden Listat</>
                ) : (
                  <><MessageSquarePlus className="size-3 mr-1" /> Crear Orden</>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}

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
