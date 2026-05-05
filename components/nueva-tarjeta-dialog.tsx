"use client";

import { useState, useActionState, useEffect } from "react";
import { createTarjeta } from "@/lib/actions/tarjetas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

export function NuevaTarjetaDialog({ remaining }: { remaining: number }) {
  const [open, setOpen] = useState(false);
  const [error, formAction, isPending] = useActionState(createTarjeta, undefined);

  // Cerrar el diálogo si la acción fue exitosa (aunque redirect lo cerraría al recargar la página, 
  // en Next.js a veces es mejor manejar el estado localmente si se prefiere).
  // Sin embargo, como createTarjeta redirige, el componente se desmontará.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={remaining === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarjeta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Nueva Tarjeta de Monitoreo</DialogTitle>
            <DialogDescription>
              Configura una nueva alerta para que la IA inicie el rastreo de publicaciones.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="keyword">Palabra Clave</Label>
              <Input
                id="keyword"
                name="keyword"
                placeholder="Ej: El Deber"
                required
                disabled={isPending}
              />
              <p className="text-[10px] text-muted-foreground">La palabra o frase que usarías en el buscador de Facebook.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="context">Contexto para Filtrado (Opcional)</Label>
              <Textarea
                id="context"
                name="context"
                placeholder="Ej: Solo noticias relacionadas a su juicio, evitar deportes."
                className="min-h-[100px]"
                disabled={isPending}
              />
              <p className="text-[10px] text-muted-foreground">Ayuda a la IA a filtrar publicaciones irrelevantes.</p>
            </div>
            {error && <div className="text-destructive text-sm font-medium">{error.error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Creando..." : "Crear Tarjeta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
