import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function PerfilPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground">Gestiona tu información personal y cuenta.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
            <CardDescription>
              Detalles básicos de tu cuenta en TeloComento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Nombre</Label>
              <Input value={session?.user?.name || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Correo Electrónico</Label>
              <Input value={session?.user?.email || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Rol</Label>
              <Input value={session?.user?.role || "USER"} disabled className="uppercase" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
