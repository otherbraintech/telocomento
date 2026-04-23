"use client";

import { useState } from "react";
import { rejectPublication, approvePublication, createOrderFromPublication } from "@/lib/actions/publications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

type PublicationWithCard = {
  id: string;
  sourceUrl: string;
  authorName: string | null;
  content: string | null;
  imageUrl: string | null;
  sentiment: string;
  scrapingCard: {
    keyword: string;
    context: string | null;
  };
};

export default function ReviewFeed({ initialPublications }: { initialPublications: PublicationWithCard[] }) {
  const [publications, setPublications] = useState(initialPublications);
  const [activePub, setActivePub] = useState<PublicationWithCard | null>(publications[0] || null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [intent, setIntent] = useState<"POSITIVE" | "NEGATIVE">("POSITIVE");
  const [notes, setNotes] = useState("");
  
  const router = useRouter();

  if (publications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg bg-accent/5">
        <Bot className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">Todo al día</h3>
        <p className="text-muted-foreground">No hay nuevas publicaciones pendientes de revisión.</p>
      </div>
    );
  }

  const nextPublication = () => {
    const updated = publications.filter(p => p.id !== activePub?.id);
    setPublications(updated);
    setActivePub(updated[0] || null);
  };

  const handleReject = async () => {
    if (!activePub) return;
    setIsPending(true);
    await rejectPublication(activePub.id);
    nextPublication();
    setIsPending(false);
  };

  const handleApproveClick = () => {
    setIsModalOpen(true);
  };

  const submitOrder = async () => {
    if (!activePub) return;
    setIsPending(true);
    try {
      await createOrderFromPublication(activePub.id, intent, notes);
      setIsModalOpen(false);
      nextPublication();
      setNotes("");
      setIntent("POSITIVE");
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        {activePub && (
          <Card className="w-full max-w-md border-border/50 shadow-2xl relative overflow-hidden transition-all duration-300">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline">
                  {activePub.scrapingCard.keyword}
                </Badge>
                <a href={activePub.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                  {activePub.authorName?.charAt(0) || "F"}
                </div>
                <p className="text-sm font-medium">{activePub.authorName || "Perfil de Facebook"}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6 min-h-[300px] flex flex-col gap-4">
              {activePub.imageUrl && (
                <div className="w-full aspect-video rounded-md overflow-hidden bg-accent/20">
                  <img 
                    src={activePub.imageUrl} 
                    alt="Miniatura de la publicación" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-lg leading-relaxed">
                {activePub.content || "Contenido multimedia o no detectado."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-6 pt-6 pb-8 border-t">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110"
                onClick={handleReject}
                disabled={isPending}
              >
                <X className="w-8 h-8" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110"
                onClick={handleApproveClick}
                disabled={isPending}
              >
                <Check className="w-8 h-8" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-border/50 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aprobar y Crear Orden</DialogTitle>
            <DialogDescription>
              Configura cómo debe responder la IA a esta publicación.
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
            <div className="bg-accent/30 p-3 rounded-md border border-border/50">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Se generarán comentarios únicos usando los bots disponibles.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={submitOrder} disabled={isPending}>
              {isPending ? "Procesando..." : "Confirmar Orden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
