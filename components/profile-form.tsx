"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X, Lock, Check } from "lucide-react"
import { updateProfile, updatePassword } from "@/lib/actions/profile"
import { toast } from "sonner"

interface ProfileFormProps {
  user: any
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || ""
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateProfile(formData)
      toast.success("Perfil actualizado correctamente")
      setIsEditing(false)
    } catch (error) {
      toast.error("Error al actualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden")
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres")
    }

    setIsLoading(true)
    try {
      await updatePassword(passwordData.newPassword)
      toast.success("Contraseña actualizada correctamente")
      setShowPasswordForm(false)
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast.error("Error al cambiar contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>Detalles básicos de tu cuenta.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="size-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing || isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Usuario (@)</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={!isEditing || isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Correo Electrónico</Label>
            <Input value={user?.email || ""} disabled className="bg-muted/50" />
            <p className="text-[10px] text-muted-foreground">El email no puede ser modificado por seguridad.</p>
          </div>
          <div className="grid gap-2">
            <Label>Rol</Label>
            <Badge variant="secondary" className="w-fit uppercase">{user?.role}</Badge>
          </div>
        </form>

        {isEditing && (
          <div className="pt-4 border-t border-border/50 space-y-4">
            {!showPasswordForm ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                onClick={() => setShowPasswordForm(true)}
              >
                <Lock className="size-4 mr-2" />
                Cambiar contraseña
              </Button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 rounded-lg bg-accent/5 border border-border/50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">Cambiar Contraseña</p>
                  <Button type="button" variant="ghost" size="icon" className="size-6" onClick={() => setShowPasswordForm(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Nueva Contraseña"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirmar Contraseña"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full md:w-fit" disabled={isLoading}>
                  {isLoading ? "Cambiando..." : "Actualizar Contraseña"}
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2 border-t border-border/50 bg-accent/5 pt-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="size-4 mr-2" />
            Cancelar
          </Button>
          <Button form="profile-form" type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : (
              <>
                <Save className="size-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
