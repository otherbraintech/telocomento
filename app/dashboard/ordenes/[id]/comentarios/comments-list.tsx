"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  RefreshCw,
  Pencil,
  Trash2,
  Smartphone,
  ThumbsUp,
  ThumbsDown,
  Zap,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  regenerateComment,
  regenerateMultipleComments,
  editComment,
  deleteComment,
  autoAssignDevicesToOrder,
  updateOrderNotes,
} from "@/lib/actions/orders";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface CommentItem {
  id: string;
  content: string;
  status: string;
  createdAt: Date;
  commentedAt: Date | null;
  deviceId: string | null;
  device: {
    id: string;
    alias: string | null;
    serial: string;
    model: string | null;
    socialAccounts?: {
      user: string | null;
      redSocial: string;
    }[];
  } | null;
}

interface OrderData {
  id: string;
  intent: string;
  notes: string | null;
  status: string;
  publication: {
    content: string | null;
    sourceUrl: string;
    authorName: string | null;
    scrapingCard?: {
      keyword: string;
    } | null;
    user?: {
      name: string | null;
    } | null;
  };
  comments: CommentItem[];
}

const commentStatusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  PENDING: {
    label: "Pendiente",
    icon: <Clock className="size-3" />,
    className: "text-muted-foreground border-border",
  },
  SENT: {
    label: "Enviado",
    icon: <Loader2 className="size-3 animate-spin" />,
    className: "text-blue-500 border-blue-500/30 bg-blue-500/5",
  },
  PUBLISHED: {
    label: "Publicado",
    icon: <CheckCircle2 className="size-3" />,
    className: "text-green-500 border-green-500/30 bg-green-500/5",
  },
  ERROR: {
    label: "Error",
    icon: <AlertCircle className="size-3" />,
    className: "text-destructive border-destructive/30 bg-destructive/5",
  },
};

export default function CommentsList({ order }: { order: OrderData }) {
  const router = useRouter();
  const [comments, setComments] = useState(order.comments);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Editar
  const [editOpen, setEditOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<CommentItem | null>(null);
  const [editContent, setEditContent] = useState("");

  // Eliminar
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Asignación de bots
  const [isAssigning, setIsAssigning] = useState(false);

  // Edición de notas de la orden
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [newNotes, setNewNotes] = useState(order.notes || "");

  const handleUpdateNotes = async () => {
    const toastId = toast.loading("Actualizando instrucciones de la orden...");
    try {
      await updateOrderNotes(order.id, newNotes);
      toast.success("Instrucciones actualizadas", { id: toastId });
      setEditNotesOpen(false);
      window.location.reload();
    } catch (e) {
      toast.error("Error al actualizar instrucciones", { id: toastId });
    }
  };

  const handleAutoAssign = async () => {
    const toastId = toast.loading("Sincronizando y vinculando bots libres...");
    setIsAssigning(true);
    try {
      const res = await autoAssignDevicesToOrder(order.id);
      if (res.success) {
        toast.success(`Se han vinculado ${res.assignedCount} bots nuevos.`, { id: toastId });
        window.location.reload();
      }
    } catch (e: any) {
      toast.error(e.message || "Error al vincular bots", { id: toastId });
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === comments.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(comments.map((c) => c.id)));
    }
  };

  const handleRegenerate = async (id: string) => {
    const toastId = toast.loading("Regenerando comentario con IA...");
    setLoadingId(id);
    try {
      await regenerateComment(id);
      toast.success("Comentario regenerado", { id: toastId });
      window.location.reload();
    } catch (e) {
      toast.error("Error al regenerar comentario", { id: toastId });
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkRegenerate = async () => {
    if (selected.size === 0) return;
    const toastId = toast.loading(`Regenerando ${selected.size} comentarios con IA...`);
    setBulkLoading(true);
    try {
      await regenerateMultipleComments(Array.from(selected));
      toast.success(`${selected.size} comentarios regenerados`, { id: toastId });
      setSelected(new Set());
      window.location.reload();
    } catch (e) {
      toast.error("Error al regenerar comentarios", { id: toastId });
    } finally {
      setBulkLoading(false);
    }
  };

  const openEdit = (comment: CommentItem) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editingComment) return;
    const toastId = toast.loading("Guardando cambios...");
    try {
      await editComment(editingComment.id, editContent);
      toast.success("Comentario editado", { id: toastId });
      setComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? { ...c, content: editContent } : c))
      );
      setEditOpen(false);
    } catch (e) {
      toast.error("Error al editar comentario", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const toastId = toast.loading("Eliminando comentario...");
    try {
      await deleteComment(deleteId);
      toast.success("Comentario eliminado", { id: toastId });
      setComments((prev) => prev.filter((c) => c.id !== deleteId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteId(null);
    } catch (e) {
      toast.error("Error al eliminar comentario", { id: toastId });
    }
  };

  const publishedCount = comments.filter((c) => c.status === "PUBLISHED").length;

  return (
    <div className="space-y-6">
      {/* Header con info de la orden */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground mb-2"
            onClick={() => router.push("/dashboard/ordenes")}
          >
            <ArrowLeft className="size-3.5" />
            Volver a Órdenes
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Comentarios de la Orden
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={order.intent === "POSITIVE" ? "outline" : "destructive"} className="gap-1">
              {order.intent === "POSITIVE" ? <ThumbsUp className="size-3" /> : <ThumbsDown className="size-3" />}
              {order.intent === "POSITIVE" ? "Apoyo" : "Crítica"}
            </Badge>
            <span>•</span>
            <span>{order.publication.scrapingCard?.keyword || order.publication.user?.name || "Perfil Personal"}</span>
            <span>•</span>
            <span>{publishedCount}/{comments.length} publicados</span>
          </div>
        </div>
        <a
          href={order.publication.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="size-5" />
        </a>
      </div>

      {/* Contexto de la orden */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Instrucción IA</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 h-7 w-7 text-primary hover:bg-primary/10"
                onClick={() => setEditNotesOpen(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
            <ScrollArea className="h-[80px]">
              <p className="text-sm text-foreground/80 italic leading-relaxed">
                &ldquo;{order.notes || "Sin instrucciones específicas"}&rdquo;
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Publicación original</p>
            <ScrollArea className="h-[80px]">
              <p className="text-sm text-foreground/80">
                &ldquo;{order.publication.content || "Sin contenido"}&rdquo;
              </p>
            </ScrollArea>
            {order.publication.authorName && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">— {order.publication.authorName}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Globales */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-3">
          <Checkbox
            id="select-all"
            checked={selected.size === comments.length && comments.length > 0}
            onCheckedChange={toggleAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Seleccionar todos ({comments.length})
          </label>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {selected.size > 0 ? (
            <Button
              size="sm"
              variant="default"
              onClick={handleBulkRegenerate}
              disabled={bulkLoading}
              className="flex-1 sm:flex-initial gap-1.5 shadow-sm"
            >
              <RefreshCw className={`size-3.5 ${bulkLoading ? "animate-spin" : ""}`} />
              Regenerar Seleccionados ({selected.size})
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const allIds = comments.map(c => c.id);
                setSelected(new Set(allIds));
                handleBulkRegenerate();
              }}
              disabled={bulkLoading || comments.length === 0}
              className="flex-1 sm:flex-initial gap-1.5"
            >
              <Zap className={`size-3.5 ${bulkLoading ? "animate-spin" : ""}`} />
              Regenerar Toda la Orden
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={handleAutoAssign}
            disabled={isAssigning || comments.every(c => c.deviceId !== null)}
            className="flex-1 sm:flex-initial gap-1.5"
          >
            {isAssigning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Smartphone className="size-3.5" />
            )}
            Autovincular Bots
          </Button>
        </div>
      </div>

      {/* Tabla de comentarios con soporte multilínea */}
      <Card className="border-border/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="min-w-[400px]">Contenido del Comentario</TableHead>
              <TableHead className="w-[150px]">Bot Asignado</TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead className="text-right w-[150px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                  <MessageSquare className="size-12 mx-auto mb-4 opacity-20" />
                  <p>No hay comentarios generados para esta orden.</p>
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => {
                const cfg = commentStatusConfig[comment.status] || commentStatusConfig.PENDING;
                const isSelected = selected.has(comment.id);
                
                return (
                  <TableRow key={comment.id} className={isSelected ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(comment.id)}
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="bg-muted/20 rounded-lg p-3 border border-border/30">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90 font-medium">
                          {comment.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {comment.device ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="size-3 text-primary" />
                            <span className="font-bold text-foreground">
                              {comment.device.socialAccounts?.[0]?.user || comment.device.alias || comment.device.serial.slice(0, 8)}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            {comment.device.socialAccounts?.[0] ? "Cuenta Activa" : "Sin Perfil"}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                          Sin Bot
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] h-6 gap-1 ${cfg.className}`}>
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openEdit(comment)}
                          title="Editar"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => handleRegenerate(comment.id)}
                          disabled={loadingId === comment.id}
                          title="Regenerar"
                        >
                          <RefreshCw className={`size-3.5 ${loadingId === comment.id ? "animate-spin" : ""}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(comment.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Diálogo Editar Notas de la Orden */}
      <Dialog open={editNotesOpen} onOpenChange={setEditNotesOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Instrucciones de la Orden</DialogTitle>
            <DialogDescription>
              Modifica las instrucciones que usará la IA para generar o regenerar comentarios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Ej: Criticar a Sebastian por su falta de compromiso..."
              className="min-h-[120px] resize-none bg-muted/20"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditNotesOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateNotes}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg border-border/50">
          <DialogHeader>
            <DialogTitle>Editar comentario</DialogTitle>
            <DialogDescription>
              Ajusta el tono o el contenido para que sea más natural.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="resize-none text-base bg-muted/20"
            placeholder="Escribe el comentario aquí..."
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="shadow-sm">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tendrás que regenerar uno nuevo si lo borras por error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
