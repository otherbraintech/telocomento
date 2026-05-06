"use client";

import { useState, useEffect, useMemo, Dispatch, SetStateAction } from "react";
import { rejectPublication, approvePublication } from "@/lib/actions/publications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Bot, Loader2, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
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

type PublicationWithCard = {
  id: string;
  sourceUrl: string;
  imageUrl: string;
  authorName: string | null;
  content: string | null;
  publishedAt: Date;
  reviewStatus: string;
  scrapingCard?: {
    keyword: string;
    context: string | null;
  } | null;
  user?: {
    name: string | null;
    bio: string | null;
  } | null;
};

/* ================================================================
 * GRID VIEW — Componente separado para la vista de cuadrícula
 * ================================================================ */

function GridView({
  publications: initialPubs,
  setPublications: setParentPubs,
  emptyState,
  setPubToReject,
}: {
  publications: PublicationWithCard[];
  setPublications: Dispatch<SetStateAction<PublicationWithCard[]>>;
  emptyState: React.ReactNode;
  setPubToReject: Dispatch<SetStateAction<string | null>>;
}) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === initialPubs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(initialPubs.map((p) => p.id)));
  };

  const handleBatchAction = async (action: "approve" | "reject") => {
    if (selectedIds.size === 0) return;
    setIsBatchLoading(true);
    const idsToProcess = Array.from(selectedIds);
    
    toast.promise(
      Promise.all(idsToProcess.map(id => action === "approve" ? approvePublication(id) : rejectPublication(id))),
      {
        loading: `${action === "approve" ? "Aprobando" : "Rechazando"} ${selectedIds.size} publicaciones...`,
        success: () => {
          setParentPubs(prev => prev.filter(p => !selectedIds.has(p.id)));
          setSelectedIds(new Set());
          return `${selectedIds.size} publicaciones ${action === "approve" ? "aprobadas" : "rechazadas"}`;
        },
        error: "Error al procesar el lote",
      }
    );
    setIsBatchLoading(false);
  };

  const handleGridAction = async (pubId: string, action: "approve" | "reject") => {
    if (action === "reject") {
      setPubToReject(pubId);
      return;
    }
    setLoadingIds((prev) => new Set(prev).add(pubId));

    try {
      if (action === "approve") {
        await approvePublication(pubId);
        toast.success("Publicación aprobada", { position: "bottom-right", duration: 1000 });
      } else {
        await rejectPublication(pubId);
        toast.error("Publicación rechazada", { position: "bottom-right", duration: 1000 });
      }

      setParentPubs((prev) => prev.filter((p) => p.id !== pubId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(pubId);
        return next;
      });
    } catch (e) {
      console.error(e);
      toast.error("Error al procesar la publicación");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(pubId);
        return next;
      });
    }
  };

  if (initialPubs.length === 0) {
    return emptyState;
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Batch Actions Toolbar */}
      <div className="flex items-center justify-between bg-accent/50 p-2 rounded-lg border border-border/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs">
             {selectedIds.size === initialPubs.length ? "Deseleccionar todo" : "Seleccionar todo"}
           </Button>
           {selectedIds.size > 0 && (
             <span className="text-xs font-bold text-primary">
               {selectedIds.size} seleccionadas
             </span>
           )}
        </div>
        <div className="flex items-center gap-2">
           {selectedIds.size > 0 && (
             <>
               <Button 
                 variant="destructive" 
                 size="sm" 
                 className="h-8 text-xs gap-1.5" 
                 disabled={isBatchLoading}
                 onClick={() => handleBatchAction("reject")}
               >
                 <X className="w-3.5 h-3.5" />
                 Rechazar lote
               </Button>
               <Button 
                 size="sm" 
                 className="h-8 text-xs gap-1.5" 
                 disabled={isBatchLoading}
                 onClick={() => handleBatchAction("approve")}
               >
                 <Check className="w-3.5 h-3.5" />
                 Aprobar lote
               </Button>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {initialPubs.map((pub) => {
            const isLoading = loadingIds.has(pub.id);
            const isSelected = selectedIds.has(pub.id);
          return (
            <motion.div
              key={pub.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative group"
            >
              <div 
                className={`absolute inset-0 z-10 cursor-pointer rounded-xl transition-colors ${isSelected ? 'bg-primary/5 ring-2 ring-primary/50' : ''}`}
                onClick={() => toggleSelection(pub.id)}
              />
              <div className="absolute top-2 left-2 z-20">
                <Checkbox 
                  checked={isSelected} 
                  onCheckedChange={() => toggleSelection(pub.id)}
                  className="border-white/50 bg-black/20"
                />
              </div>
              <Card className={`border-border bg-card overflow-hidden flex flex-col h-full transition-all duration-300 ${isSelected ? 'ring-2 ring-primary/50 shadow-lg' : 'shadow-sm'}`}>
                {/* Header compacto */}
                <CardHeader className="pt-1.5 pb-2 px-3 border-b shrink-0 bg-card/30 relative z-20">
                  <div className="flex items-center justify-between mb-0.5">
                    <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">
                      {pub.scrapingCard?.keyword || "General"}
                    </Badge>
                    <a
                      href={pub.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-all p-1 hover:bg-primary/10 rounded-full"
                      title="Ver publicación original"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex items-end justify-between gap-3 mt-0">
                    <p className="text-sm font-black text-foreground leading-tight truncate flex-1" title={pub.authorName || "Perfil"}>
                      {pub.authorName || "Perfil de Facebook"}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0 mb-0.5">
                      {new Date(pub.publishedAt).toLocaleDateString("es-ES", { 
                        day: "numeric", 
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </CardHeader>

                {/* Imagen */}
                {pub.imageUrl && (
                  <div className="w-full h-[140px] overflow-hidden bg-accent/5 border-b border-border/5">
                    <img
                      src={pub.imageUrl}
                      alt="Post"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Contenido */}
                <CardContent className="px-3 py-2.5 flex-1">
                  <p className="text-[13px] leading-relaxed text-foreground/80 font-normal line-clamp-3">
                    {pub.content || "Contenido multimedia o no detectado."}
                  </p>
                </CardContent>

                {/* Botones de acción */}
                <CardFooter className="px-3 py-3 border-t bg-card/50 flex justify-center gap-8 relative z-20">
                  <div className="flex flex-col items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-10 h-10 rounded-full border-2 border-red-200 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm group/btn"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGridAction(pub.id, "reject");
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      )}
                    </Button>
                    <span className="text-[11px] font-black text-red-500 uppercase tracking-wider">Rechazar</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-10 h-10 rounded-full border-2 border-emerald-200 bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGridAction(pub.id, "approve");
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      )}
                    </Button>
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">Aprobar</span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>    </div>
  );
}

export default function ReviewFeed({ initialPublications }: { initialPublications: PublicationWithCard[] }) {
  const [publications, setPublications] = useState(initialPublications);
  const [isPending, setIsPending] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
  const [combo, setCombo] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pubToReject, setPubToReject] = useState<string | null>(null);

  // Filtrar publicaciones basadas en la búsqueda
  const filteredPublications = publications.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.authorName?.toLowerCase().includes(query) ||
      p.content?.toLowerCase().includes(query) ||
      p.scrapingCard?.keyword.toLowerCase().includes(query)
    );
  });

  // El activePub debe ser el primero de la lista filtrada
  const displayPub = viewMode === "swipe" ? filteredPublications[0] : null;

  const handleConfirmReject = async () => {
    if (!pubToReject) return;
    setIsPending(true);
    try {
      await rejectPublication(pubToReject);
      setPublications(prev => prev.filter(p => p.id !== pubToReject));
      toast.error("Publicación rechazada", { position: "bottom-right", duration: 1000 });
    } catch (e) {
      console.error(e);
      toast.error("Error al rechazar");
    } finally {
      setIsPending(false);
      setPubToReject(null);
    }
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "swipe" || isPending || isExiting || !displayPub) return;
      
      if (e.key === "ArrowRight") {
        handleApprove();
      } else if (e.key === "ArrowLeft") {
        handleReject();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, isPending, isExiting, displayPub]);

  // Escuchar cambio de vista desde el toolbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<"swipe" | "grid">).detail;
      setViewMode(detail);
      setCombo(0); // Reset combo on view change
    };
    window.addEventListener("review-view-change", handler);
    return () => window.removeEventListener("review-view-change", handler);
  }, []);

  // Escuchar búsqueda
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setSearchQuery(detail);
    };
    window.addEventListener("review-search", handler);
    return () => window.removeEventListener("review-search", handler);
  }, []);

  // Umbral alto para evitar swipes accidentales
  const SWIPE_THRESHOLD = 350;

  // Framer Motion values for drag
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const cardOpacity = useTransform(x, [-500, -400, 0, 400, 500], [0.3, 1, 1, 1, 0.3]);
  
  // Color overlays - empiezan a aparecer después de 120px
  const approveOpacity = useTransform(x, [0, 120, 350], [0, 0.15, 0.8]);
  const rejectOpacity = useTransform(x, [0, -120, -350], [0, 0.15, 0.8]);

  // Text visibility - solo aparece cuando se acerca al umbral
  const approveTextOpacity = useTransform(x, [250, 350], [0, 1]);
  const rejectTextOpacity = useTransform(x, [-250, -350], [0, 1]);
  const approveTextScale = useTransform(x, [250, 350], [0.5, 1]);
  const rejectTextScale = useTransform(x, [-250, -350], [0.5, 1]);

  useEffect(() => {
    setPublications(initialPublications);
  }, [initialPublications]);

  const triggerParticles = (color: string) => {
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 450,
      y: (Math.random() - 0.5) * 450,
      color
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const nextPublication = (idToRemove: string) => {
    setPublications(prev => prev.filter(p => p.id !== idToRemove));
    setIsExiting(false);
    x.set(0); 
  };

  // Anima la tarjeta volando hacia un lado y luego ejecuta la acción
  const flyAndAct = async (direction: "left" | "right") => {
    if (!displayPub || isPending || isExiting) return;
    setIsPending(true);
    setIsExiting(true);

    const flyTo = direction === "right" ? 1200 : -1200;
    const pubToProcess = displayPub;

    // Partículas y toast inmediato
    if (direction === "right") {
      triggerParticles("#22c55e");
      setCombo(prev => prev + 1);
      const currentCombo = combo + 1;
      if (currentCombo > 2) {
        toast.success(`¡Combo x${currentCombo}! 🔥`, { position: "bottom-right", duration: 800 });
      } else {
        toast.success("Publicación aprobada", { position: "bottom-right", duration: 1000 });
      }
    } else {
      triggerParticles("#ef4444");
      setCombo(0);
      toast.error("Publicación rechazada", { position: "bottom-right", duration: 1000 });
    }

    // Animar la card volando hacia el lado con efecto de escala
    await animate(x, flyTo, { duration: 0.3, ease: "easeIn" });

    // Ejecutar acción en servidor sin bloquear la UI de la siguiente tarjeta
    const processAction = async () => {
      try {
        if (direction === "right") {
          await approvePublication(pubToProcess.id);
        } else {
          await rejectPublication(pubToProcess.id);
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al procesar la publicación", { duration: 1500 });
      }
    };
    
    processAction(); // Corre en segundo plano

    nextPublication(pubToProcess.id);
    setIsPending(false);
  };

  const handleReject = () => flyAndAct("left");
  const handleApprove = () => flyAndAct("right");

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (isExiting) return;
    // Si superó el umbral, vuela hacia el lado
    if (info.offset.x > SWIPE_THRESHOLD) {
      flyAndAct("right");
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      flyAndAct("left");
    } else {
      // No alcanzó el umbral: regresar suavemente al centro
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  // Transformaciones para los botones
  const rejectScale = useTransform(x, [-350, 0], [1.2, 1]);
  const approveScale = useTransform(x, [0, 350], [1, 1.2]);
  const rejectBg = useTransform(x, [-350, 0], ["rgb(239 68 68)", "rgba(239 68 68, 0.05)"]);
  const approveBg = useTransform(x, [0, 350], ["rgba(34 197 94, 0.05)", "rgb(34 197 94)"]);
  const rejectColor = useTransform(x, [-350, 0], ["#ffffff", "#ef4444"]);
  const approveColor = useTransform(x, [0, 350], ["#22c55e", "#ffffff"]);

  const getStatusBorder = (status: string) => {
    return "border-border shadow-2xl";
  };

  const renderCardContent = (pub: PublicationWithCard | null, isBackground = false, onApprove?: () => void, onReject?: () => void) => {
    if (!pub) return null;
    return (
      <Card className={`w-full ${getStatusBorder(pub.reviewStatus)} relative overflow-hidden bg-card select-none flex flex-col transition-colors duration-300 ${isBackground ? 'pointer-events-none' : ''}`}>
        {!isBackground && (
          <>
            {/* Feedback Overlays */}
            <motion.div style={{ opacity: approveOpacity }} className="absolute inset-0 bg-green-600/70 z-50 pointer-events-none flex items-center justify-center">
              <motion.div 
                style={{ opacity: approveTextOpacity, scale: approveTextScale, rotate: -15 }}
                className="border-[12px] border-white px-8 py-3 rounded-2xl drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                <span className="text-white text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg uppercase">Aprobar</span>
              </motion.div>
            </motion.div>

            <motion.div style={{ opacity: rejectOpacity }} className="absolute inset-0 bg-red-600/70 z-50 pointer-events-none flex items-center justify-center">
              <motion.div 
                style={{ opacity: rejectTextOpacity, scale: rejectTextScale, rotate: 15 }}
                className="border-[12px] border-white px-8 py-3 rounded-2xl drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                <span className="text-white text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg uppercase">Rechazar</span>
              </motion.div>
            </motion.div>
          </>
        )}
        
        <CardHeader className="pt-2 pb-2.5 px-4 border-b shrink-0 bg-card/30">
          <div className="flex items-center justify-between mb-1">
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0 h-5 bg-primary/10 text-primary border-none">
              {pub.scrapingCard?.keyword || "General"}
            </Badge>
            {!isBackground && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] gap-1.5 px-2 bg-background/50 hover:bg-primary/10 hover:text-primary transition-all border-border/50"
                asChild
              >
                <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Ver publicación <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
          <div className="flex items-end justify-between gap-4 mt-0">
            <h3 className="text-[15px] font-black text-foreground leading-tight truncate flex-1" title={pub.authorName || "Perfil"}>
              {pub.authorName || "Perfil de Facebook"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium shrink-0 mb-0.5">
              {new Date(pub.publishedAt).toLocaleDateString("es-ES", { 
                day: "numeric", 
                month: "short",
                year: "numeric"
              })}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col bg-card overflow-hidden">
          {pub.imageUrl && (
            <div className="w-full h-[170px] sm:h-[220px] overflow-hidden bg-accent/5 shrink-0 border-b border-border/10">
              <img src={pub.imageUrl} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" draggable={false} />
            </div>
          )}
          <div className="px-4 py-3 flex flex-col gap-1">
            <p className="text-[13px] leading-relaxed text-foreground/80 font-normal line-clamp-3">
              {pub.content || "Contenido multimedia o no detectado."}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center items-center px-6 py-4 border-t shrink-0 bg-card/50">
          <div className="flex gap-12">
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                style={!isBackground ? { scale: rejectScale, backgroundColor: rejectBg, color: rejectColor } : {}}
                whileHover={!isBackground ? { scale: 1.1, backgroundColor: "rgb(239, 68, 68)", color: "#ffffff" } : {}}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-lg active:scale-90 ${isBackground ? 'border-destructive/10 bg-destructive/5 text-destructive/30' : 'border-destructive/20 bg-destructive/5'}`}
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
              <span className="text-[12px] font-black text-red-500 uppercase tracking-widest">Rechazar</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                style={!isBackground ? { scale: approveScale, backgroundColor: approveBg, color: approveColor } : {}}
                whileHover={!isBackground ? { scale: 1.1, backgroundColor: "rgb(34, 197, 94)", color: "#ffffff" } : {}}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all shadow-lg active:scale-90 ${isBackground ? 'border-primary/10 bg-primary/5 text-primary/30' : 'border-primary/20 bg-primary/5'}`}
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
              <span className="text-[12px] font-black text-emerald-500 uppercase tracking-widest">Aprobar</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const nextPub = publications[1];

  /* ================================================================
   * EMPTY STATE — Compartido entre ambas vistas
   * ================================================================ */
  const emptyState = (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-10 h-10 text-primary animate-bounce" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">¡Todo al día!</h3>
      <p className="text-muted-foreground text-sm max-w-[250px] mb-8">
        No tienes publicaciones pendientes de revisión en este momento.
      </p>
      <Button asChild variant="outline" size="sm" className="gap-2">
        <Link href="/dashboard/tarjetas">
          Ver mis tarjetas
        </Link>
      </Button>
    </div>
  );

  /* ================================================================
   * VISTA GRID — Cards compactas en cuadrícula con scroll
   * ================================================================ */
  if (viewMode === "grid") {
    return (
      <GridView
        publications={filteredPublications}
        setPublications={setPublications}
        emptyState={emptyState}
        setPubToReject={setPubToReject}
      />
    );
  }

  /* ================================================================
   * VISTA SWIPE (Original) — Stack de tarjetas con drag
   * ================================================================ */
  return (
    <>
      <AlertDialog open={!!pubToReject} onOpenChange={(open) => !open && setPubToReject(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <AlertDialogTitle className="text-xl font-black">Confirmar Rechazo</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que deseas rechazar esta publicación? Esta acción no se puede deshacer fácilmente.
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

      <div className="flex flex-col items-center justify-start w-full h-[calc(100vh-260px)] min-h-[400px] overflow-hidden -mt-2 relative">
      {/* Swipe Hints - Premium Design */}
      <div className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:flex flex-col items-center gap-4 z-0">
        <div className="flex gap-0 mb-1">
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               animate={{ x: [0, -10, 0], opacity: [0.2, 1, 0.2] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: (2-i) * 0.2 }}
             >
               <ChevronLeft className="w-6 h-6 text-destructive" />
             </motion.div>
           ))}
        </div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], borderColor: ["rgba(239,68,68,0.2)", "rgba(239,68,68,0.5)", "rgba(239,68,68,0.2)"] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="size-16 rounded-full border-4 flex items-center justify-center bg-destructive/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
        >
          <X className="w-8 h-8 text-destructive" />
        </motion.div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive text-center max-w-[120px] mt-2">Desliza para rechazar</span>
      </div>

      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none hidden lg:flex flex-col items-center gap-4 z-0">
        <div className="flex gap-0 mb-1">
           {[0, 1, 2].map((i) => (
             <motion.div
               key={i}
               animate={{ x: [0, 10, 0], opacity: [0.2, 1, 0.2] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
             >
               <ChevronRight className="w-6 h-6 text-emerald-500" />
             </motion.div>
           ))}
        </div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], borderColor: ["rgba(16,185,129,0.2)", "rgba(16,185,129,0.5)", "rgba(16,185,129,0.2)"] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="size-16 rounded-full border-4 flex items-center justify-center bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <Check className="w-8 h-8 text-emerald-500" />
        </motion.div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 text-center max-w-[120px] mt-2">Desliza para aprobar</span>
      </div>
      {/* Particles Container */}
      <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center">
        <AnimatePresence>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              key="combo-badge"
              className="absolute top-10 flex flex-col items-center pointer-events-none"
            >
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xl font-black shadow-lg border-2 border-white animate-bounce">
                COMBO x{combo}
              </div>
              <div className="text-[10px] font-bold text-primary uppercase mt-1 drop-shadow-sm">
                ¡Racha de aprobación!
              </div>
            </motion.div>
          )}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                opacity: 0, 
                scale: 0,
                rotate: Math.random() * 360
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative w-full max-w-md px-4 sm:px-0 h-full max-h-[550px]">
        {/* 1. Fondo de "Todo listo" */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
          {filteredPublications.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
               <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
               <h3 className="text-lg font-bold">Sin resultados</h3>
               <p className="text-sm text-muted-foreground">No hay publicaciones que coincidan con "{searchQuery}"</p>
            </div>
          ) : emptyState}
        </div>

        {/* 2. Segunda Tarjeta */}
        {displayPub && filteredPublications[1] && (
          <div className="absolute top-2 left-3 right-3 h-[97%] z-20" style={{ transform: 'scale(0.96)' }}>
            {renderCardContent(filteredPublications[1], true)}
          </div>
        )}

        {/* 3. Tarjeta Activa — sin dragConstraints para que no rebote */}
        <AnimatePresence mode="popLayout">
          {displayPub && (
            <motion.div
              key={displayPub.id}
              style={{ x, rotate, opacity: cardOpacity }}
              drag={isPending ? false : "x"}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.01, cursor: 'grabbing' }}
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute top-4 left-0 right-0 h-[calc(100%-12px)] z-30 cursor-grab active:cursor-grabbing px-1 sm:px-0"
            >
              {renderCardContent(displayPub, false, handleApprove, handleReject)}
            </motion.div>
          )}
        </AnimatePresence>      </div>
      </div>
    </>
  );
}


