"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { 
  Play, 
  Square, 
  Trash2, 
  Wand2, 
  MessageSquare, 
  ExternalLink,
  Clock,
  Eye,
  Zap,
  ThumbsUp,
  ThumbsDown,
  StickyNote,
} from "lucide-react";
import { generateOrderComments, startOrder, stopOrder, cancelOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface OrderItem {
  id: string;
  intent: string;
  notes: string | null;
  status: string;
  createdAt: Date;
  publication: {
    content: string | null;
    sourceUrl: string;
    authorName: string | null;
    scrapingCard: {
      keyword: string;
    };
  };
  _count: {
    comments: number;
  };
  publishedCount: number;
}

export default function OrdersList({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmStartId, setConfirmStartId] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async (id: string) => {
    setLoadingId(id);
    try {
      await generateOrderComments(id);
      toast.success("Comentarios generados correctamente");
      window.location.reload();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error al generar comentarios";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleStartConfirm = async () => {
    if (!confirmStartId) return;
    setLoadingId(confirmStartId);
    try {
      await startOrder(confirmStartId);
      toast.success("Orden activada — los bots comenzarán a comentar");
      window.location.reload();
    } catch (e) {
      toast.error("Error al iniciar orden");
    } finally {
      setLoadingId(null);
      setConfirmStartId(null);
    }
  };

  const handleStop = async (id: string) => {
    setLoadingId(id);
    try {
      await stopOrder(id);
      toast.info("Orden detenida");
      window.location.reload();
    } catch (e) {
      toast.error("Error al detener orden");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setLoadingId(id);
    try {
      await cancelOrder(id);
      toast.success("Orden cancelada");
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "CANCELLED" } : o));
    } catch (e) {
      toast.error("Error al cancelar orden");
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge variant="secondary">Borrador</Badge>;
      case "GENERATED": return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Comentarios Listos</Badge>;
      case "ACTIVATED": return <Badge className="bg-emerald-600 hover:bg-emerald-700">Activada</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-green-500 hover:bg-green-600">Ejecutando</Badge>;
      case "STOPPED": return <Badge variant="outline" className="text-orange-500 border-orange-500/30">Detenida</Badge>;
      case "COMPLETED": return <Badge className="bg-primary">Completada</Badge>;
      case "CANCELLED": return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const totalComments = order._count.comments;
          const publishedComments = order.publishedCount;
          const progressPercent = totalComments > 0 ? Math.round((publishedComments / totalComments) * 100) : 0;

          return (
            <Card key={order.id} className="flex flex-col border-border/50 shadow-sm relative overflow-hidden group">
              {(order.status === "IN_PROGRESS" || order.status === "ACTIVATED") && (
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
              )}
              
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold truncate max-w-[200px]">
                      {order.publication.scrapingCard.keyword}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                       {getStatusBadge(order.status)}
                       <Badge variant={order.intent === 'POSITIVE' ? 'outline' : 'destructive'} className="text-[10px] h-4 gap-0.5">
                         {order.intent === 'POSITIVE' ? <ThumbsUp className="size-2.5" /> : <ThumbsDown className="size-2.5" />}
                         {order.intent === 'POSITIVE' ? 'Apoyo' : 'Crítica'}
                       </Badge>
                    </div>
                  </div>
                  <a href={order.publication.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 flex-1 space-y-3">
                {/* Instrucción IA */}
                {order.notes && (
                  <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="size-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Instrucción IA</span>
                    </div>
                    <p className="text-xs text-foreground/80 line-clamp-2">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Contenido publicación */}
                <div className="bg-muted/30 p-3 rounded-lg border border-border/20">
                   <p className="text-xs text-foreground/80 line-clamp-3 italic">
                     &ldquo;{order.publication.content || "Sin contenido"}&rdquo;
                   </p>
                   {order.publication.authorName && (
                     <p className="text-[10px] text-muted-foreground mt-1.5">— {order.publication.authorName}</p>
                   )}
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Comentarios</p>
                     <div className="flex items-center gap-1.5 font-semibold">
                       <MessageSquare className="size-3 text-primary" />
                       {publishedComments} / {totalComments}
                     </div>
                   </div>
                   <div className="space-y-1">
                     <p className="text-muted-foreground">Creada</p>
                     <div className="flex items-center gap-1.5 font-semibold">
                       <Clock className="size-3 text-muted-foreground" />
                       {new Date(order.createdAt).toLocaleDateString()}
                     </div>
                   </div>
                </div>

                {/* Barra de progreso */}
                {(order.status === "IN_PROGRESS" || order.status === "ACTIVATED") && totalComments > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span>Progreso de publicación</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-3 border-t bg-muted/5 flex flex-col gap-2">
                {/* Botón ver comentarios */}
                {order.status !== "DRAFT" && totalComments > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs gap-1.5"
                    onClick={() => router.push(`/dashboard/ordenes/${order.id}/comentarios`)}
                  >
                    <Eye className="size-3" />
                    Ver Comentarios ({totalComments})
                  </Button>
                )}

                {/* Acciones principales */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  {order.status === "DRAFT" || order.status === "STOPPED" || order.status === "GENERATED" ? (
                    <>
                      {totalComments === 0 ? (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="col-span-2 h-9 font-semibold"
                          onClick={() => handleGenerate(order.id)}
                          disabled={loadingId === order.id}
                        >
                          <Wand2 className="size-3.5 mr-2" />
                          Generar Comentarios
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-9 font-semibold"
                          onClick={() => setConfirmStartId(order.id)}
                          disabled={loadingId === order.id}
                        >
                          <Play className="size-3.5 mr-2 fill-current" />
                          Empezar
                        </Button>
                      )}
                    </>
                  ) : order.status === "IN_PROGRESS" || order.status === "ACTIVATED" ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-9 font-semibold border-orange-500/50 text-orange-600 hover:bg-orange-50"
                      onClick={() => handleStop(order.id)}
                      disabled={loadingId === order.id}
                    >
                      <Square className="size-3.5 mr-2 fill-current" />
                      Detener
                    </Button>
                  ) : null}

                  {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(order.id)}
                      disabled={loadingId === order.id}
                    >
                      <Trash2 className="size-3.5 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* AlertDialog de confirmación para Empezar */}
      <AlertDialog open={!!confirmStartId} onOpenChange={(open) => !open && setConfirmStartId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Activar esta orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto sincronizará los dispositivos disponibles y activará la orden para que los bots comiencen a publicar los comentarios. Los dispositivos asignados se marcarán como ocupados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Sí, confirmo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
