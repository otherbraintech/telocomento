import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { UserManagementActions } from "@/components/user-management-actions";
import { UserDialog } from "@/components/user-dialog";

export default async function UsuariosPage() {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      status: true,
      cardLimit: true,
      orderLimit: true,
      isRequestingTickets: true,
      createdAt: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground">Administra las cuentas, estados y límites de tarjetas y órdenes.</p>
        </div>
        <UserDialog />
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Usuario</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-center">Tarjetas</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-center">Órdenes</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rol</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.isRequestingTickets && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] h-4 px-1 animate-pulse">
                              SOLICITANDO
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="font-mono font-bold text-lg">{user.cardLimit}</span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className="font-mono font-bold text-lg">{user.orderLimit}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={user.status === "ACTIVE" ? "outline" : "destructive"} className={user.status === "ACTIVE" ? "border-green-500 text-green-500" : ""}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <UserManagementActions user={user} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
