"use client";

import { useState } from "react";
import { registerUser } from "@/lib/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await registerUser(undefined, formData);

    if (result.error) {
      setError(result.error);
      setIsPending(false);
    } else if (result.success) {
      // Ingresar y redirigir a configurar la primera tarjeta
      // Usamos el email como identificador para el login automático después del registro
      await signIn("credentials", {
        identifier: result.email,
        password: result.password,
        redirectTo: "/dashboard/tarjetas/nueva"
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Juan Pérez"
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="username">Nombre de Usuario (@usuario)</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="juanperez123"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="juan@ejemplo.com"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <div className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 p-2 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Procesando..." : "Crear Cuenta"}
      </Button>
    </form>
  );
}
