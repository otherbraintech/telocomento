"use client";

import { useActionState } from "react";
import { createTarjeta } from "@/lib/actions/tarjetas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NuevaTarjetaForm() {
  const [error, formAction, isPending] = useActionState(createTarjeta, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keyword">Palabra Clave</Label>
        <Input
          id="keyword"
          name="keyword"
          placeholder="Ej: El Deber"
          required
        />
        <p className="text-xs text-muted-foreground">La palabra exacta o frase a buscar en las publicaciones.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="context">Contexto para Filtrado (Opcional)</Label>
        <textarea
          id="context"
          name="context"
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ej: Solo noticias relacionadas a su juicio, evitar deportes."
        />
        <p className="text-xs text-muted-foreground">Ayuda a la app externa a saber si la publicación realmente trata sobre tu palabra clave.</p>
      </div>

      {error && <div className="text-red-500 text-sm font-medium">{error.error}</div>}

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Crear Tarjeta"}
        </Button>
      </div>
    </form>
  );
}
