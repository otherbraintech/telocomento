"use client";

import { useState, useEffect } from "react";
import { rejectPublication, approvePublication } from "@/lib/actions/publications";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink, Bot, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

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

export default function ReviewFeed({ initialPublications }: { initialPublications: PublicationWithCard[] }) {
  const [publications, setPublications] = useState(initialPublications);
  const [activePub, setActivePub] = useState<PublicationWithCard | null>(publications[0] || null);
  const [isPending, setIsPending] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");

  // Escuchar cambio de vista desde el toolbar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<"swipe" | "grid">).detail;
      setViewMode(detail);
    };
    window.addEventListener("review-view-change", handler);
    return () => window.removeEventListener("review-view-change", handler);
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
    setActivePub(initialPublications[0] || null);
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

  const nextPublication = () => {
    const updated = publications.filter(p => p.id !== activePub?.id);
    setPublications(updated);
    setActivePub(updated[0] || null);
    setIsExiting(false);
    x.set(0); 
  };

  // Anima la tarjeta volando hacia un lado y luego ejecuta la acción
  const flyAndAct = async (direction: "left" | "right") => {
    if (!activePub || isPending || isExiting) return;
    setIsPending(true);
    setIsExiting(true);

    const flyTo = direction === "right" ? 1200 : -1200;

    // Partículas y toast inmediato
    if (direction === "right") {
      triggerParticles("#22c55e");
      toast.success("Publicación aprobada", { position: "bottom-right" });
    } else {
      triggerParticles("#ef4444");
      toast.error("Publicación rechazada", { position: "bottom-right" });
    }

    // Animar la card volando hacia el lado
    await animate(x, flyTo, { duration: 0.35, ease: "easeIn" });

    // Ejecutar acción en servidor
    try {
      if (direction === "right") {
        await approvePublication(activePub.id);
      } else {
        await rejectPublication(activePub.id);
      }
    } catch (e) {
      console.error(e);
    }

    nextPublication();
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
  const rejectScale = useTransform(x, [-350, 0], [1.3, 1]);
  const approveScale = useTransform(x, [0, 350], [1, 1.3]);
  const rejectBg = useTransform(x, [-350, 0], ["rgb(239 68 68)", "rgba(239 68 68, 0.05)"]);
  const approveBg = useTransform(x, [0, 350], ["rgba(34 197 94, 0.05)", "rgb(34 197 94)"]);
  const rejectColor = useTransform(x, [-350, 0], ["#ffffff", "#ef4444"]);
  const approveColor = useTransform(x, [0, 350], ["#22c55e", "#ffffff"]);

  const renderCardContent = (pub: typeof activePub, isBackground = false, onApprove?: () => void, onReject?: () => void) => {
    if (!pub) return null;
    return (
      <Card className={`w-full border-border shadow-2xl relative overflow-hidden bg-card select-none flex flex-col ${isBackground ? 'pointer-events-none' : ''}`}>
        {!isBackground && (
          <>
            {/* Feedback Overlays */}
            <motion.div style={{ opacity: approveOpacity }} className="absolute inset-0 bg-green-600/70 z-50 pointer-events-none flex items-center justify-center">
              <motion.div 
                style={{ opacity: approveTextOpacity, scale: approveTextScale, rotate: -15 }}
                className="border-[12px] border-white px-8 py-3 rounded-2xl drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                <span className="text-white text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg">APROBADO</span>
              </motion.div>
            </motion.div>

            <motion.div style={{ opacity: rejectOpacity }} className="absolute inset-0 bg-red-600/70 z-50 pointer-events-none flex items-center justify-center">
              <motion.div 
                style={{ opacity: rejectTextOpacity, scale: rejectTextScale, rotate: 15 }}
                className="border-[12px] border-white px-8 py-3 rounded-2xl drop-shadow-[0_0_20px_rgba(0,0,0,0.4)]"
              >
                <span className="text-white text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-lg">RECHAZADO</span>
              </motion.div>
            </motion.div>
          </>
        )}
        
        <CardHeader className="py-2.5 px-5 border-b shrink-0 bg-card">
          <div className="flex justify-between items-center mb-1.5">
            <Badge variant="outline" className="max-w-[180px] truncate text-[11px] font-medium">
              {pub.scrapingCard?.keyword || `Perfil: ${pub.user?.name || 'Personal'}`}
            </Badge>
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
        publications={publications}
        setPublications={setPublications}
        emptyState={emptyState}
      />
    );
  }

  /* ================================================================
   * VISTA SWIPE (Original) — Stack de tarjetas con drag
   * ================================================================ */
  return (
    <div className="flex flex-col items-center justify-start w-full h-[calc(100vh-260px)] min-h-[400px] overflow-hidden -mt-2 relative">
      {/* Particles Container */}
      <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center">
        <AnimatePresence>
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
          {emptyState}
        </div>

        {/* 2. Segunda Tarjeta */}
        {activePub && nextPub && (
          <div className="absolute top-2 left-3 right-3 h-[97%] z-20" style={{ transform: 'scale(0.96)' }}>
            {renderCardContent(nextPub, true)}
          </div>
        )}

        {/* 3. Tarjeta Activa — sin dragConstraints para que no rebote */}
        <AnimatePresence mode="popLayout">
          {activePub && !isExiting && (
            <motion.div
              key={activePub.id}
              style={{ x, rotate, opacity: cardOpacity }}
              drag={isPending ? false : "x"}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.01, cursor: 'grabbing' }}
              initial={{ scale: 0.98, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute top-4 left-0 right-0 h-[calc(100%-12px)] z-30 cursor-grab active:cursor-grabbing px-1 sm:px-0"
            >
              {renderCardContent(activePub, false, handleApprove, handleReject)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


/* ================================================================
 * GRID VIEW — Componente separado para la vista de cuadrícula
 * ================================================================ */

function GridView({
  publications: initialPubs,
  setPublications: setParentPubs,
  emptyState,
}: {
  publications: PublicationWithCard[];
  setPublications: React.Dispatch<React.SetStateAction<PublicationWithCard[]>>;
  emptyState: React.ReactNode;
}) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleGridAction = async (pubId: string, action: "approve" | "reject") => {
    setLoadingIds((prev) => new Set(prev).add(pubId));

    try {
      if (action === "approve") {
        await approvePublication(pubId);
        toast.success("Publicación aprobada", { position: "bottom-right" });
      } else {
        await rejectPublication(pubId);
        toast.error("Publicación rechazada", { position: "bottom-right" });
      }

      // Remover de la lista con animación
      setParentPubs((prev) => prev.filter((p) => p.id !== pubId));
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
      <AnimatePresence mode="popLayout">
        {initialPubs.map((pub) => {
          const isLoading = loadingIds.has(pub.id);
          return (
            <motion.div
              key={pub.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Card className="border-border bg-card overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-200 group">
                {/* Header compacto */}
                <CardHeader className="py-2 px-3.5 border-b shrink-0 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-6 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold shrink-0 border border-border/50">
                        {pub.authorName?.charAt(0) || "F"}
                      </div>
                      <p className="text-[12px] font-semibold truncate">{pub.authorName || "Perfil de Facebook"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {new Date(pub.publishedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                      <a
                        href={pub.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
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
                <CardContent className="p-3.5 flex-1">
                  <Badge variant="outline" className="text-[10px] font-medium mb-2 max-w-full truncate">
                    {pub.scrapingCard?.keyword || `Perfil: ${pub.user?.name || "Personal"}`}
                  </Badge>
                  <p className="text-[13px] leading-snug text-foreground/85 line-clamp-3 mt-1">
                    {pub.content || "Contenido multimedia o no detectado."}
                  </p>
                </CardContent>

                {/* Botones de acción */}
                <CardFooter className="px-3.5 py-2.5 border-t bg-card/50 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1.5 border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    disabled={isLoading}
                    onClick={() => handleGridAction(pub.id, "reject")}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                    onClick={() => handleGridAction(pub.id, "approve")}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Aprobar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
