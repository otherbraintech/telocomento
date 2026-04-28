"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Loader2, MessageSquare, Save } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { updateOrderAdmin, deleteOrder, getOrderCommentsAdmin, editComment, deleteComment } from "@/lib/actions/orders"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function OrderAdminActions({ order }: { order: any }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    status: order.status,
    intent: order.intent,
    notes: order.notes || ""
  })

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      await updateOrderAdmin(order.id, formData)
      toast.success("Orden actualizada")
      setShowEdit(false)
    } catch (error) {
      toast.error("Error al actualizar")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteOrder(order.id)
      toast.success("Orden eliminada")
      setShowDelete(false)
    } catch (error) {
      toast.error("Error al eliminar")
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    setIsCommentsLoading(true)
    try {
      const data = await getOrderCommentsAdmin(order.id)
      setComments(data)
    } catch (error) {
      toast.error("No se pudieron cargar los comentarios")
    } finally {
      setIsCommentsLoading(false)
    }
  }

  const handleUpdateComment = async (id: string, content: string) => {
    try {
      await editComment(id, content)
      toast.success("Comentario actualizado")
      loadComments()
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id)
      toast.success("Comentario eliminado")
      loadComments()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            setShowComments(true)
            loadComments()
          }}>
            <MessageSquare className="mr-2 h-4 w-4" /> Ver Comentarios
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar Orden
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Orden
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Editar Orden */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Orden (Admin)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Intención</Label>
              <Select value={formData.intent} onValueChange={(val) => setFormData({...formData, intent: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITIVE">Apoyo (POSITIVE)</SelectItem>
                  <SelectItem value="NEGATIVE">Crítica (NEGATIVE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Estado de la Orden</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="GENERATED">Generado</SelectItem>
                  <SelectItem value="ACTIVATED">Activado</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="STOPPED">Detenido</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Notas</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ver/Editar Comentarios */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comentarios de la Orden</DialogTitle>
          </DialogHeader>
          
          {isCommentsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin size-8 text-primary" /></div>
          ) : (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {comments.length === 0 && <p className="text-center text-muted-foreground italic">No hay comentarios generados aún.</p>}
                {comments.map((comment) => (
                  <div key={comment.id} className="space-y-3 bg-accent/20 p-4 rounded-lg border border-border/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{comment.status}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {comment.id.slice(-6)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary">{comment.device?.alias || 'Sin dispositivo'}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea 
                      defaultValue={comment.content} 
                      onBlur={(e) => {
                        if (e.target.value !== comment.content) {
                          handleUpdateComment(comment.id, e.target.value)
                        }
                      }}
                      className="text-xs bg-background"
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter className="mt-4">
            <Button onClick={() => setShowComments(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación de la orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la orden y todos sus comentarios. Se liberarán los dispositivos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
