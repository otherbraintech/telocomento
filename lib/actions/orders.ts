"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateComments } from "@/lib/ai/openrouter";
import { syncDevices, getFreeDevices } from "@/lib/actions/devices";

/**
 * Genera comentarios para una orden basándose en la cantidad de dispositivos disponibles.
 * Cada comentario se asigna a un dispositivo libre.
 */
export async function generateOrderComments(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { publication: true },
  });

  if (!order) throw new Error("Orden no encontrada");

  // Sincronizar dispositivos antes de generar
  try {
    await syncDevices();
  } catch (e) {
    console.warn("No se pudo sincronizar dispositivos:", e);
  }

  // Obtener dispositivos libres (con cuenta)
  const freeDevices = await getFreeDevices();
  const deviceCount = freeDevices.length;

  if (deviceCount === 0) {
    throw new Error("No hay dispositivos disponibles con cuenta activa. Sincroniza o registra dispositivos primero.");
  }

  // Generar comentarios con IA, uno por dispositivo disponible
  const aiComments = await generateComments(
    order.publication.content || "",
    order.intent,
    order.notes || "",
    deviceCount
  );

  if (aiComments.length > 0) {
    // Limpiar comentarios previos
    await prisma.comment.deleteMany({ where: { orderId } });

    // Crear comentarios asignando un dispositivo a cada uno
    await prisma.comment.createMany({
      data: aiComments.map((c, index) => ({
        orderId,
        content: c,
        status: "PENDING" as const,
        deviceId: freeDevices[index % freeDevices.length]?.id || null,
      })),
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "GENERATED" },
    });
  }

  revalidatePath("/dashboard/ordenes");
}

/**
 * Iniciar una orden: sincroniza dispositivos, marca dispositivos como OCUPADO,
 * y cambia la orden a ACTIVATED.
 */
export async function startOrder(orderId: string) {
  // Sincronizar dispositivos primero
  try {
    await syncDevices();
  } catch (e) {
    console.warn("No se pudo sincronizar dispositivos:", e);
  }

  // Obtener los comentarios de la orden con sus dispositivos asignados
  const comments = await prisma.comment.findMany({
    where: { orderId, status: "PENDING" },
    select: { deviceId: true },
  });

  // Marcar dispositivos asignados como OCUPADO
  const deviceIds = comments
    .map((c) => c.deviceId)
    .filter((id): id is string => id !== null);

  if (deviceIds.length > 0) {
    await prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { status: "OCUPADO" },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ACTIVATED" },
  });

  revalidatePath("/dashboard/ordenes");
}

export async function stopOrder(orderId: string) {
  // Liberar dispositivos asignados a esta orden
  const comments = await prisma.comment.findMany({
    where: { orderId, status: "PENDING" },
    select: { deviceId: true },
  });

  const deviceIds = comments
    .map((c) => c.deviceId)
    .filter((id): id is string => id !== null);

  if (deviceIds.length > 0) {
    await prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { status: "LIBRE" },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "STOPPED" },
  });
  revalidatePath("/dashboard/ordenes");
}

export async function cancelOrder(orderId: string) {
  // Liberar dispositivos
  const comments = await prisma.comment.findMany({
    where: { orderId },
    select: { deviceId: true },
  });

  const deviceIds = comments
    .map((c) => c.deviceId)
    .filter((id): id is string => id !== null);

  if (deviceIds.length > 0) {
    await prisma.device.updateMany({
      where: { id: { in: deviceIds } },
      data: { status: "LIBRE" },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/dashboard/ordenes");
}

// ────────────────────────────────────────────
// ACCIONES DE COMENTARIOS INDIVIDUALES
// ────────────────────────────────────────────

/**
 * Regenerar un comentario individual manteniendo el mismo dispositivo.
 */
export async function regenerateComment(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      order: {
        include: { publication: true },
      },
    },
  });

  if (!comment) throw new Error("Comentario no encontrado");

  const aiComments = await generateComments(
    comment.order.publication.content || "",
    comment.order.intent,
    comment.order.notes || "",
    1
  );

  if (aiComments.length > 0) {
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: aiComments[0],
        status: "PENDING",
        commentedAt: null,
      },
    });
  }

  revalidatePath(`/dashboard/ordenes/${comment.orderId}/comentarios`);
}

/**
 * Regenerar múltiples comentarios seleccionados.
 */
export async function regenerateMultipleComments(commentIds: string[]) {
  for (const id of commentIds) {
    await regenerateComment(id);
  }
}

/**
 * Editar el contenido de un comentario.
 */
export async function editComment(commentId: string, content: string) {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });
  revalidatePath(`/dashboard/ordenes/${comment.orderId}/comentarios`);
}

/**
 * Eliminar un comentario.
 */
export async function deleteComment(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { orderId: true },
  });
  if (!comment) throw new Error("Comentario no encontrado");

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/dashboard/ordenes/${comment.orderId}/comentarios`);
}
