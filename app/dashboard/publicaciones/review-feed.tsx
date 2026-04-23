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
  content: string | null;
  sentiment: string;
  scrapingCard: {
    keyword: string;
    topic: string;
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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-zinc-800 border-dashed rounded-lg bg-zinc-950">
        <Bot className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Todo al día</h3>
        <p className="text-zinc-400">No hay nuevas publicaciones pendientes de revisión.</p>
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
      // Opcional: Redirigir a órdenes o mostrar toast
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
          <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-white shadow-2xl relative overflow-hidden transition-all duration-300">
            <CardHeader className="pb-3 border-b border-zinc-900">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="bg-zinc-900 text-zinc-300 border-zinc-800">
                  {activePub.scrapingCard.keyword}
                </Badge>
                <a href={activePub.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-zinc-500">Causa: {activePub.scrapingCard.topic}</p>
            </CardHeader>
            <CardContent className="pt-6 min-h-[250px] flex items-center justify-center">
              <p className="text-lg text-center leading-relaxed">
                {activePub.content || "Contenido multimedia o no detectado."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-6 pt-6 pb-8 border-t border-zinc-900">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-red-900 bg-red-950/30 text-red-500 hover:bg-red-900 hover:text-white transition-all hover:scale-110"
                onClick={handleReject}
                disabled={isPending}
              >
                <X className="w-8 h-8" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full border-2 border-green-900 bg-green-950/30 text-green-500 hover:bg-green-900 hover:text-white transition-all hover:scale-110"
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
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aprobar y Crear Orden</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Configura cómo debe responder la IA a esta publicación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="intent">Objetivo de los bots</Label>
              <Select value={intent} onValueChange={(v: "POSITIVE" | "NEGATIVE") => setIntent(v)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-zinc-700">
                  <SelectValue placeholder="Selecciona la intención" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
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
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 text-white resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="bg-zinc-900 p-3 rounded-md border border-zinc-800">
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Se generarán comentarios únicos usando los bots disponibles.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-zinc-900 hover:text-white text-zinc-400">Cancelar</Button>
            <Button onClick={submitOrder} disabled={isPending} className="bg-white text-black hover:bg-zinc-200">
              {isPending ? "Procesando..." : "Confirmar Orden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
