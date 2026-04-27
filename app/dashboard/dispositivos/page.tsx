import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DevicesList from "./devices-list";

export default async function DispositivosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const devices = await prisma.device.findMany({
    include: { socialAccounts: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispositivos</h1>
        <p className="text-sm text-muted-foreground">
          Administra los teléfonos/bots registrados y sus cuentas sociales.
        </p>
      </div>

      <DevicesList initialDevices={devices} />
    </div>
  );
}
