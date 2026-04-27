"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import {
  regenerateComment,
  regenerateMultipleComments,
  editComment,
  deleteComment,
} from "@/lib/actions/orders";
import { toast } from "sonner";

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
    setLoadingId(id);
    try {
      await regenerateComment(id);
      toast.success("Comentario regenerado");
      window.location.reload();
    } catch (e) {
      toast.error("Error al regenerar comentario");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkRegenerate = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await regenerateMultipleComments(Array.from(selected));
      toast.success(`${selected.size} comentarios regenerados`);
      setSelected(new Set());
      window.location.reload();
    } catch (e) {
      toast.error("Error al regenerar comentarios");
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
    try {
      await editComment(editingComment.id, editContent);
      toast.success("Comentario editado");
      setComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? { ...c, content: editContent } : c))
      );
      setEditOpen(false);
    } catch (e) {
      toast.error("Error al editar comentario");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteComment(deleteId);
      toast.success("Comentario eliminado");
      setComments((prev) => prev.filter((c) => c.id !== deleteId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
      setDeleteId(null);
    } catch (e) {
      toast.error("Error al eliminar comentario");
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
        {order.notes && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="size-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Instrucción IA</span>
              </div>
              <p className="text-sm text-foreground/80">{order.notes}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">Publicación original</p>
            <p className="text-sm text-foreground/80 italic line-clamp-4">
              &ldquo;{order.publication.content || "Sin contenido"}&rdquo;
            </p>
            {order.publication.authorName && (
              <p className="text-xs text-muted-foreground mt-2">— {order.publication.authorName}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones batch */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm font-medium">{selected.size} seleccionados</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkRegenerate}
            disabled={bulkLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${bulkLoading ? "animate-spin" : ""}`} />
            Regenerar seleccionados
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="text-muted-foreground">
            Deseleccionar
          </Button>
        </div>
      )}

      {/* Tabla de comentarios */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selected.size === comments.length && comments.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="min-w-[300px]">Contenido</TableHead>
                <TableHead>Bot asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Publicado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No hay comentarios generados para esta orden.
                  </TableCell>
                </TableRow>
              ) : (
                comments.map((comment) => {
                  const cfg = commentStatusConfig[comment.status] || commentStatusConfig.PENDING;
                  return (
                    <TableRow key={comment.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selected.has(comment.id)}
                          onCheckedChange={() => toggleSelect(comment.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{comment.content}</p>
                      </TableCell>
                      <TableCell>
                        {comment.device ? (
                          <div className="flex items-center gap-1.5">
                            <Smartphone className="size-3 text-muted-foreground" />
                            <span className="text-xs">{comment.device.alias || comment.device.serial.slice(0, 8)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {comment.commentedAt
                          ? new Date(comment.commentedAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            onClick={() => openEdit(comment)}
                            title="Editar"
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            onClick={() => handleRegenerate(comment.id)}
                            disabled={loadingId === comment.id}
                            title="Regenerar"
                          >
                            <RefreshCw className={`size-3 ${loadingId === comment.id ? "animate-spin" : ""}`} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(comment.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar comentario</DialogTitle>
            <DialogDescription>
              Modifica el contenido del comentario antes de que sea publicado.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Este comentario será eliminado permanentemente de la orden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
