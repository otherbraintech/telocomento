"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Loader2, ExternalLink } from "lucide-react"
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
import { updatePublicationAdmin, deletePublication } from "@/lib/actions/publications"
import { toast } from "sonner"

export function PublicationAdminActions({ publication }: { publication: any }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    sourceUrl: publication.sourceUrl,
    authorName: publication.authorName || "",
    content: publication.content || "",
    reviewStatus: publication.reviewStatus
  })

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      await updatePublicationAdmin(publication.id, formData)
      toast.success("Publicación actualizada")
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
      await deletePublication(publication.id)
      toast.success("Publicación eliminada")
      setShowDelete(false)
    } catch (error) {
      toast.error("Error al eliminar")
    } finally {
      setIsLoading(false)
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
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Publicación (Admin)</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Source URL</Label>
              <Input 
                value={formData.sourceUrl} 
                onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Autor</Label>
              <Input 
                value={formData.authorName} 
                onChange={(e) => setFormData({...formData, authorName: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label>Contenido</Label>
              <Textarea 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})} 
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Estado de Revisión</Label>
              <Select 
                value={formData.reviewStatus} 
                onValueChange={(val) => setFormData({...formData, reviewStatus: val})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="APPROVED">APPROVED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
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

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la publicación del sistema.
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
