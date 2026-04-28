"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserCircle, Save, Loader2 } from "lucide-react"
import { updateProfile } from "@/lib/actions/profile"
import { toast } from "sonner"

interface ProfileSetupDialogProps {
  user: {
    id: string
    name: string | null
    username: string | null
    bio: string | null
  }
}

export function ProfileSetupDialog({ user }: ProfileSetupDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || ""
  })

  useEffect(() => {
    // Abrir el diálogo si el nombre o la biografía están vacíos
    if (!user.name || !user.bio) {
      setOpen(true)
    }
  }, [user.name, user.bio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.bio.trim()) {
      return toast.error("Por favor completa tu nombre y biografía para continuar.")
    }

    setIsLoading(true)
    try {
      await updateProfile(formData)
      toast.success("Perfil completado correctamente")
      setOpen(false)
      router.push("/dashboard/publicaciones")
    } catch (error) {
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : setOpen}>
      <DialogContent className="sm:max-w-[500px] border-border/50 overflow-hidden p-0">
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCircle className="size-7 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Completa tu perfil</DialogTitle>
              <DialogDescription>
                Necesitamos esta información para personalizar tu experiencia de scraping.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="setup-name">Nombre Completo</Label>
              <Input
                id="setup-name"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="setup-bio">Biografía / Descripción Personal</Label>
              <Textarea
                id="setup-bio"
                placeholder="Ej: Soy un emprendedor digital enfocado en marketing para restaurantes en Lima..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[120px] resize-none"
                required
              />
              <p className="text-[11px] text-muted-foreground italic">
                💡 Esta descripción ayuda a nuestra IA a encontrar publicaciones que hablen sobre ti o tus intereses en Facebook.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Finalizar Configuración
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
