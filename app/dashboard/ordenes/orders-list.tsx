"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Square, 
  Trash2, 
  Wand2, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  CircleDashed
} from "lucide-react";
import { generateOrderComments, startOrder, stopOrder, cancelOrder } from "@/lib/actions/orders";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function OrdersList({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleGenerate = async (id: string) => {
    setLoadingId(id);
    try {
      await generateOrderComments(id);
      toast.success("Comentarios generados correctamente");
    } catch (e) {
      toast.error("Error al generar comentarios");
    } finally {
      setLoadingId(null);
    }
  };

  const handleStart = async (id: string) => {
    setLoadingId(id);
    try {
      await startOrder(id);
      toast.success("Orden iniciada");
    } catch (e) {
      toast.error("Error al iniciar orden");
    } finally {
      setLoadingId(null);
    }
  };

  const handleStop = async (id: string) => {
    setLoadingId(id);
    try {
      await stopOrder(id);
      toast.info("Orden detenida");
    } catch (e) {
      toast.error("Error al detener orden");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Estás seguro de cancelar esta orden?")) return;
    setLoadingId(id);
    try {
      await cancelOrder(id);
      toast.success("Orden cancelada");
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
      case "IN_PROGRESS": return <Badge className="bg-green-500 hover:bg-green-600">Ejecutando</Badge>;
      case "STOPPED": return <Badge variant="outline" className="text-orange-500 border-orange-500/30">Detenida</Badge>;
      case "COMPLETED": return <Badge className="bg-primary">Completada</Badge>;
      case "CANCELLED": return <Badge variant="destructive">Cancelada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-col border-border/50 shadow-sm relative overflow-hidden group">
          {order.status === "IN_PROGRESS" && (
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
                   <Badge variant={order.intent === 'POSITIVE' ? 'outline' : 'destructive'} className="text-[10px] h-4">
                     {order.intent === 'POSITIVE' ? '+' : '-'}
                   </Badge>
                </div>
              </div>
              <a href={order.publication.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="size-4" />
              </a>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 flex-1 space-y-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-border/20">
               <p className="text-xs text-foreground/80 line-clamp-3 italic">
                 "{order.publication.content || "Sin contenido"}"
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px]">
               <div className="space-y-1">
                 <p className="text-muted-foreground">Comentarios</p>
                 <div className="flex items-center gap-1.5 font-semibold">
                   <MessageSquare className="size-3 text-primary" />
                   {order._count.comments} / 5
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

            {order.status === "IN_PROGRESS" && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-medium">
                  <span>Progreso de publicación</span>
                  <span>40%</span>
                </div>
                <Progress value={40} className="h-1.5" />
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 border-t bg-muted/5 grid grid-cols-2 gap-2">
            {order.status === "DRAFT" || order.status === "STOPPED" || order.status === "GENERATED" ? (
              <>
                {order._count.comments === 0 ? (
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
                    onClick={() => handleStart(order.id)}
                    disabled={loadingId === order.id}
                  >
                    <Play className="size-3.5 mr-2 fill-current" />
                    Empezar
                  </Button>
                )}
              </>
            ) : order.status === "IN_PROGRESS" ? (
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
