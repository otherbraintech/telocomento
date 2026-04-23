import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "./register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">
          Regístrate para empezar a monitorear con TeloComento
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <RegisterForm />
        <div className="text-center text-sm mt-4 text-muted-foreground">
          ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline font-medium">Inicia Sesión</Link>
        </div>
      </CardContent>
    </Card>
  );
}
