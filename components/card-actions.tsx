"use client"

import { useState } from "react"
import { MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { deleteTarjeta, updateTarjeta } from "@/lib/actions/tarjetas"
import { toast } from "sonner"

interface CardActionsProps {
  card: {
    id: string
    keyword: string
    context: string | null
  }
}

export function CardActions({ card }: CardActionsProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    keyword: card.keyword,
    context: card.context || ""
  })

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateTarjeta(card.id, formData)
      toast.success("Tarjeta actualizada")
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
      await deleteTarjeta(card.id)
      toast.success("Tarjeta eliminada")
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
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEdit(true)} className="gap-2">
            <Edit2 className="h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDelete(true)} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogo de Edición */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Tarjeta</DialogTitle>
              <DialogDescription>
                Modifica los parámetros de búsqueda del scraper.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="keyword">Palabra Clave</Label>
                <Input
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="context">Contexto</Label>
                <Textarea
                  id="context"
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Contexto adicional para el scraper..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la tarjeta de monitoreo "{card.keyword}" y no se puede deshacer. Se dejarán de recolectar publicaciones para esta palabra clave.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
