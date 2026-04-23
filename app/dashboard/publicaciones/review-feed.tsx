"use client";

import { useState, useEffect } from "react";
import { rejectPublication, createOrderFromPublication } from "@/lib/actions/publications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

type PublicationWithCard = {
  id: string;
  sourceUrl: string;
  imageUrl: string;
  authorName: string | null;
  content: string | null;
  publishedAt: Date;
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

  // Framer Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // Color overlays based on swipe direction
  const approveOpacity = useTransform(x, [0, 150], [0, 0.5]);
  const rejectOpacity = useTransform(x, [0, -150], [0, 0.5]);

  useEffect(() => {
    setPublications(initialPublications);
    setActivePub(initialPublications[0] || null);
  }, [initialPublications]);

  const nextPublication = () => {
    const updated = publications.filter(p => p.id !== activePub?.id);
    setPublications(updated);
    setActivePub(updated[0] || null);
    x.set(0); // Reset drag position
  };

  const handleReject = async () => {
    if (!activePub || isPending) return;
    setIsPending(true);
    await rejectPublication(activePub.id);
    nextPublication();
    setIsPending(false);
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

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 150) {
      // Swipe Right -> Approve
      setIsModalOpen(true);
    } else if (info.offset.x < -150) {
      // Swipe Left -> Reject
      handleReject();
    }
  };

  // Transformaciones para los botones
  const rejectScale = useTransform(x, [-150, 0], [1.3, 1]);
  const approveScale = useTransform(x, [0, 150], [1, 1.3]);
  const rejectBg = useTransform(x, [-150, 0], ["rgb(239 68 68)", "rgba(239 68 68, 0.05)"]);
  const approveBg = useTransform(x, [0, 150], ["rgba(34 197 94, 0.05)", "rgb(34 197 94)"]);
  const rejectColor = useTransform(x, [-150, 0], ["#ffffff", "#ef4444"]);
  const approveColor = useTransform(x, [0, 150], ["#22c55e", "#ffffff"]);

  // Helper para renderizar el contenido de una tarjeta (usado para la activa y las de fondo)
  const renderCardContent = (pub: typeof activePub, isBackground = false, onApprove?: () => void, onReject?: () => void) => {
    if (!pub) return null;
    return (
      <Card className={`w-full border-border shadow-2xl relative overflow-hidden bg-card select-none flex flex-col ${isBackground ? 'pointer-events-none' : ''}`}>
        {/* Feedback Overlays (Solo para la activa) */}
        {!isBackground && (
          <>
            <motion.div style={{ opacity: approveOpacity }} className="absolute inset-0 bg-green-500/25 z-50 pointer-events-none transition-colors" />
            <motion.div style={{ opacity: rejectOpacity }} className="absolute inset-0 bg-red-500/25 z-50 pointer-events-none transition-colors" />
          </>
        )}
        
        <CardHeader className="py-2.5 px-5 border-b shrink-0 bg-card">
          <div className="flex justify-between items-center mb-1.5">
            <Badge variant="outline" className="max-w-[180px] truncate text-[11px] font-medium">{pub.scrapingCard.keyword}</Badge>
            {!isBackground && (
              <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold shrink-0 border border-border/50">
                {pub.authorName?.charAt(0) || "F"}
              </div>
              <p className="text-[13px] font-semibold truncate max-w-[180px]">{pub.authorName || "Perfil de Facebook"}</p>
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">
              {new Date(pub.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col bg-card overflow-hidden">
          {pub.imageUrl && (
            <div className="w-full h-[180px] sm:h-[220px] overflow-hidden bg-accent/5 shrink-0 border-b border-border/5">
              <img src={pub.imageUrl} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" draggable={false} />
            </div>
          )}
          <div className="p-5 flex flex-col gap-2">
            <p className="text-[14px] leading-snug text-foreground/90 font-normal line-clamp-3">
              {pub.content || "Contenido multimedia o no detectado."}
            </p>
            {!isBackground && (
              <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary font-bold hover:underline mt-1 inline-block" onClick={(e) => e.stopPropagation()}>
                Ver publicación original →
              </a>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-14 py-5 border-t shrink-0 bg-card/50">
          <motion.button
            style={!isBackground ? { scale: rejectScale, backgroundColor: rejectBg, color: rejectColor } : {}}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-md active:scale-90 ${isBackground ? 'border-destructive/10 bg-destructive/5 text-destructive/30' : 'border-destructive/20'}`}
            onClick={(e) => {
              if (!isBackground && onReject) {
                e.stopPropagation();
                onReject();
              }
            }}
            disabled={isBackground || isPending}
          >
            <X className="w-7 h-7" />
          </motion.button>
          <motion.button
            style={!isBackground ? { scale: approveScale, backgroundColor: approveBg, color: approveColor } : {}}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-md active:scale-90 ${isBackground ? 'border-primary/10 bg-primary/5 text-primary/30' : 'border-primary/20'}`}
            onClick={(e) => {
              if (!isBackground && onApprove) {
                e.stopPropagation();
                onApprove();
              }
            }}
            disabled={isBackground || isPending}
          >
            <Check className="w-7 h-7" />
          </motion.button>
        </CardFooter>
      </Card>
    );
  };

  const nextPub = publications[1];

  return (
    <>
      <div className="flex flex-col items-center justify-start w-full h-[calc(100vh-220px)] min-h-[400px] overflow-hidden -mt-2">
        <div className="relative w-full max-w-md px-4 sm:px-0 h-full max-h-[550px]">
          
          {/* 1. Fondo de "Todo listo" */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-20 z-0">
             <Bot className="w-10 h-10 text-muted-foreground/20 mb-3" />
             <h3 className="text-base font-semibold mb-1">¡Todo listo!</h3>
             <p className="text-muted-foreground text-[10px]">No hay más publicaciones pendientes.</p>
          </div>

          {/* 2. Segunda Tarjeta (Z-20) */}
          {activePub && nextPub && (
            <div className="absolute top-2 left-3 right-3 h-[97%] z-20" style={{ transform: 'scale(0.96)' }}>
              {renderCardContent(nextPub, true)}
            </div>
          )}

          {/* 3. Tarjeta Activa (Z-30) */}
          <AnimatePresence mode="popLayout">
            {activePub && (
              <motion.div
                key={activePub.id}
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.01, cursor: 'grabbing' }}
                initial={{ scale: 0.98, opacity: 0, y: 5 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ 
                  x: x.get() > 0 ? 1000 : -1000, 
                  opacity: 0, 
                  rotate: x.get() > 0 ? 15 : -15,
                  transition: { duration: 0.3 } 
                }}
                className="absolute top-4 left-0 right-0 h-[calc(100%-12px)] z-30 cursor-grab active:cursor-grabbing px-1 sm:px-0"
              >
                {renderCardContent(activePub, false, () => setIsModalOpen(true), handleReject)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
