"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ExternalDevice {
  serial: string;
  status: string;
  model: string;
  alias: string;
  estado_db: string;
  redes_sociales: {
    red_social: string;
    user: string;
    correo: string;
    telefono_asociado: string | null;
    estado_cuenta: string;
  }[];
  trigger_id: string;
}

interface ExternalDevicesResponse {
  status: string;
  total_online: number;
  devices: ExternalDevice[];
}

/**
 * Sincroniza dispositivos desde el servicio externo.
 * - Si el dispositivo no existe en BD → lo crea.
 * - Si existe → actualiza su estado y cuentas sociales.
 * - Si no tiene redes_sociales → estado SIN_CUENTA.
 * - Si tiene redes_sociales → estado LIBRE (si no estaba OCUPADO).
 */
export async function syncDevices() {
  const apiUrl = process.env.DEVICES_API_URL;
  const apiKey = process.env.DEVICES_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Variables de entorno DEVICES_API_URL o DEVICES_API_KEY no configuradas");
  }

  const response = await fetch(apiUrl, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error al obtener dispositivos: ${response.statusText}`);
  }

  const data: ExternalDevicesResponse = await response.json();

  for (const extDevice of data.devices) {
    const hasSocialAccounts = extDevice.redes_sociales && extDevice.redes_sociales.length > 0;
    
    // Determinar estado
    let deviceStatus: "LIBRE" | "OCUPADO" | "SIN_CUENTA" | "OFFLINE" | "ERROR" = "SIN_CUENTA";
    if (extDevice.status !== "device") {
      deviceStatus = "OFFLINE";
    } else if (hasSocialAccounts) {
      // Verificar si está ocupado actualmente
      const existingDevice = await prisma.device.findUnique({
        where: { serial: extDevice.serial },
      });
      deviceStatus = existingDevice?.status === "OCUPADO" ? "OCUPADO" : "LIBRE";
    }

    // Upsert dispositivo
    const device = await prisma.device.upsert({
      where: { serial: extDevice.serial },
      update: {
        model: extDevice.model,
        alias: extDevice.alias,
        status: deviceStatus,
        triggerId: extDevice.trigger_id,
      },
      create: {
        serial: extDevice.serial,
        model: extDevice.model,
        alias: extDevice.alias,
        status: deviceStatus,
        triggerId: extDevice.trigger_id,
      },
    });

    // Sincronizar cuentas sociales
    // Eliminar las existentes y recrearlas
    await prisma.deviceSocialAccount.deleteMany({
      where: { deviceId: device.id },
    });

    if (hasSocialAccounts) {
      await prisma.deviceSocialAccount.createMany({
        data: extDevice.redes_sociales.map((rs) => ({
          deviceId: device.id,
          redSocial: rs.red_social,
          user: rs.user || null,
          correo: rs.correo || null,
          telefonoAsociado: rs.telefono_asociado || null,
          estadoCuenta: rs.estado_cuenta || "active",
        })),
      });
    }
  }

  revalidatePath("/dashboard/dispositivos");
  return { synced: data.devices.length, totalOnline: data.total_online };
}

/**
 * Obtener todos los dispositivos con sus cuentas sociales.
 */
export async function getDevices() {
  return prisma.device.findMany({
    include: { socialAccounts: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Crear dispositivo manualmente.
 */
export async function createDevice(data: {
  serial: string;
  model?: string;
  alias?: string;
  triggerId?: string;
}) {
  await prisma.device.create({
    data: {
      serial: data.serial,
      model: data.model || null,
      alias: data.alias || null,
      triggerId: data.triggerId || null,
      status: "SIN_CUENTA",
    },
  });
  revalidatePath("/dashboard/dispositivos");
}

/**
 * Actualizar dispositivo.
 */
export async function updateDevice(
  id: string,
  data: {
    alias?: string;
    status?: "LIBRE" | "OCUPADO" | "SIN_CUENTA" | "OFFLINE" | "ERROR";
    triggerId?: string;
  }
) {
  await prisma.device.update({
    where: { id },
    data: {
      alias: data.alias,
      status: data.status,
      triggerId: data.triggerId,
    },
  });
  revalidatePath("/dashboard/dispositivos");
}

/**
 * Eliminar dispositivo.
 */
export async function deleteDevice(id: string) {
  await prisma.device.delete({ where: { id } });
  revalidatePath("/dashboard/dispositivos");
}

/**
 * Contar dispositivos con cuenta disponible (LIBRE u OCUPADO).
 */
export async function getAvailableDevicesCount(): Promise<number> {
  return prisma.device.count({
    where: {
      status: { in: ["LIBRE", "OCUPADO"] },
    },
  });
}

export async function getFreeDevices() {
  return prisma.device.findMany({
    where: { status: "LIBRE" },
    include: { socialAccounts: true },
  });
}

/**
 * Obtener todos los dispositivos listos (LIBRE u OCUPADO) con cuenta social.
 */
export async function getAvailableDevices() {
  return prisma.device.findMany({
    where: {
      status: { in: ["LIBRE", "OCUPADO"] },
      socialAccounts: { some: {} }
    },
    include: { socialAccounts: true },
  });
}
