"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Smartphone,
  Wifi,
  WifiOff,
  UserCircle,
} from "lucide-react";
import {
  syncDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} from "@/lib/actions/devices";
import { toast } from "sonner";

interface SocialAccount {
  id: string;
  redSocial: string;
  user: string | null;
  correo: string | null;
  telefonoAsociado: string | null;
  estadoCuenta: string;
}

interface Device {
  id: string;
  serial: string;
  model: string | null;
  alias: string | null;
  status: string;
  triggerId: string | null;
  socialAccounts: SocialAccount[];
  createdAt: Date;
  updatedAt: Date;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  LIBRE: { label: "Libre", variant: "outline", className: "text-green-500 border-green-500/30 bg-green-500/5" },
  OCUPADO: { label: "Ocupado", variant: "outline", className: "text-blue-500 border-blue-500/30 bg-blue-500/5" },
  SIN_CUENTA: { label: "Sin Cuenta", variant: "secondary", className: "text-muted-foreground" },
  OFFLINE: { label: "Offline", variant: "outline", className: "text-orange-500 border-orange-500/30 bg-orange-500/5" },
  ERROR: { label: "Error", variant: "destructive", className: "" },
};

export default function DevicesList({ initialDevices }: { initialDevices: Device[] }) {
  const [devices, setDevices] = useState(initialDevices);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<string>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Formulario crear
  const [newSerial, setNewSerial] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [newTrigger, setNewTrigger] = useState("");

  // Formulario editar
  const [editAlias, setEditAlias] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editTrigger, setEditTrigger] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncDevices();
      toast.success(`Sincronización completa: ${result.synced} dispositivos, ${result.totalOnline} online`);
      // Recargar página para obtener datos actualizados
      window.location.reload();
    } catch (e) {
      toast.error("Error al sincronizar dispositivos");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async () => {
    if (!newSerial.trim()) {
      toast.error("El serial es requerido");
      return;
    }
    try {
      await createDevice({
        serial: newSerial.trim(),
        model: newModel.trim() || undefined,
        alias: newAlias.trim() || undefined,
        triggerId: newTrigger.trim() || undefined,
      });
      toast.success("Dispositivo creado");
      setCreateOpen(false);
      setNewSerial("");
      setNewModel("");
      setNewAlias("");
      setNewTrigger("");
      window.location.reload();
    } catch (e) {
      toast.error("Error al crear dispositivo");
    }
  };

  const openEdit = (device: Device) => {
    setEditDevice(device);
    setEditAlias(device.alias || "");
    setEditStatus(device.status);
    setEditTrigger(device.triggerId || "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editDevice) return;
    try {
      await updateDevice(editDevice.id, {
        alias: editAlias.trim() || undefined,
        status: editStatus as "LIBRE" | "OCUPADO" | "SIN_CUENTA" | "OFFLINE" | "ERROR",
        triggerId: editTrigger.trim() || undefined,
      });
      toast.success("Dispositivo actualizado");
      setEditOpen(false);
      window.location.reload();
    } catch (e) {
      toast.error("Error al actualizar dispositivo");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDevice(id);
      toast.success("Dispositivo eliminado");
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      toast.error("Error al eliminar dispositivo");
    }
  };

  const filtered = filter === "ALL" ? devices : devices.filter((d) => d.status === filter);

  const countByStatus = {
    total: devices.length,
    libre: devices.filter((d) => d.status === "LIBRE").length,
    ocupado: devices.filter((d) => d.status === "OCUPADO").length,
    sinCuenta: devices.filter((d) => d.status === "SIN_CUENTA").length,
    offline: devices.filter((d) => d.status === "OFFLINE").length,
  };

  return (
    <div className="space-y-6">
      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setFilter("ALL")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{countByStatus.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/30 transition-colors" onClick={() => setFilter("LIBRE")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{countByStatus.libre}</p>
            <p className="text-xs text-muted-foreground">Libres</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => setFilter("OCUPADO")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{countByStatus.ocupado}</p>
            <p className="text-xs text-muted-foreground">Ocupados</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-orange-500/30 transition-colors" onClick={() => setFilter("SIN_CUENTA")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{countByStatus.sinCuenta}</p>
            <p className="text-xs text-muted-foreground">Sin Cuenta</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-orange-500/30 transition-colors" onClick={() => setFilter("OFFLINE")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{countByStatus.offline}</p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSync} disabled={syncing} variant="outline" className="gap-2">
          <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </Button>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Crear Bot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar nuevo dispositivo</DialogTitle>
              <DialogDescription>
                Agrega un teléfono/bot manualmente al sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serial">Serial *</Label>
                <Input
                  id="serial"
                  placeholder="ej: ce02171298a9940704"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="ej: SM_G950F"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alias">Alias</Label>
                <Input
                  id="alias"
                  placeholder="ej: telefono 41"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger ID</Label>
                <Input
                  id="trigger"
                  placeholder="ej: trigger_obfarmer"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {filter !== "ALL" && (
          <Button variant="ghost" size="sm" onClick={() => setFilter("ALL")} className="text-muted-foreground">
            Limpiar filtro
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Alias</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cuentas</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Smartphone className="size-8 mx-auto mb-2 opacity-30" />
                    <p>No hay dispositivos {filter !== "ALL" ? `con estado "${statusConfig[filter]?.label}"` : "registrados"}</p>
                    <p className="text-xs mt-1">Usa el botón &quot;Sincronizar&quot; para importar desde el servicio externo.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((device) => {
                  const cfg = statusConfig[device.status] || statusConfig.ERROR;
                  return (
                    <TableRow key={device.id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {device.status === "OFFLINE" ? (
                            <WifiOff className="size-3.5 text-orange-500" />
                          ) : (
                            <Wifi className="size-3.5 text-green-500" />
                          )}
                          {device.alias || "Sin alias"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{device.serial}</code>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {device.model || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className={cfg.className}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.socialAccounts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {device.socialAccounts.map((sa) => {
                              const isWhatsapp = sa.redSocial.toLowerCase().includes("whatsapp");
                              const displayName = isWhatsapp 
                                ? (sa.telefonoAsociado || sa.user) 
                                : (sa.user || sa.redSocial);
                                
                              return (
                                <Badge key={sa.id} variant="outline" className="text-[10px] h-5 gap-1">
                                  <UserCircle className="size-3" />
                                  {displayName}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {device.triggerId || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => openEdit(device)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar dispositivo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará &quot;{device.alias || device.serial}&quot; y todas sus cuentas asociadas. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(device.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar dispositivo</DialogTitle>
            <DialogDescription>
              {editDevice?.serial}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-alias">Alias</Label>
              <Input
                id="edit-alias"
                value={editAlias}
                onChange={(e) => setEditAlias(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Estado</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIBRE">Libre</SelectItem>
                  <SelectItem value="OCUPADO">Ocupado</SelectItem>
                  <SelectItem value="SIN_CUENTA">Sin Cuenta</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-trigger">Trigger ID</Label>
              <Input
                id="edit-trigger"
                value={editTrigger}
                onChange={(e) => setEditTrigger(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
