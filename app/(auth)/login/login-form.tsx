"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="identifier">Email o Usuario</Label>
        <Input
          id="identifier"
          name="identifier"
          type="text"
          placeholder="admin@telocomento.com o admin_123"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
        />
      </div>
      {errorMessage && (
        <div className="text-sm text-destructive font-medium">{errorMessage}</div>
      )}
      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
}
