import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginForm from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">TeloComento</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <LoginForm />
        <div className="text-center text-sm mt-4 text-muted-foreground">
          ¿No tienes cuenta? <Link href="/register" className="text-primary hover:underline font-medium">Regístrate</Link>
        </div>
      </CardContent>
    </Card>
  );
}
