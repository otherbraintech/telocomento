"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateComments } from "@/lib/ai/openrouter";

export async function approvePublication(id: string) {
  await prisma.publication.update({
    where: { id },
    data: { reviewStatus: "APPROVED" }
  });
  revalidatePath("/dashboard/publicaciones");
}

export async function rejectPublication(id: string) {
  await prisma.publication.update({
    where: { id },
    data: { reviewStatus: "REJECTED" }
  });
  revalidatePath("/dashboard/publicaciones");
}

export async function createOrderFromPublication(publicationId: string, intent: "POSITIVE" | "NEGATIVE", notes: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const publication = await prisma.publication.findUnique({ where: { id: publicationId } });
  if (!publication) throw new Error("Publicación no encontrada");

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      publicationId,
      intent,
      notes,
      status: "GENERATED"
    }
  });

  // Generar comentarios en base al contenido de la publicación
  const aiComments = await generateComments(publication.content || "", intent, notes, 3);

  // Obtener dispositivos libres que tengan al menos una cuenta social vinculada
  const availableDevices = await prisma.device.findMany({
    where: { 
      status: "LIBRE",
      socialAccounts: { some: {} } // Asegura que tenga cuenta registrada
    },
    take: aiComments.length
  });

  // Guardarlos en la BD con asignación automática si hay dispositivos
  if (aiComments.length > 0) {
    await prisma.comment.createMany({
      data: aiComments.map((c, index) => ({
        orderId: order.id,
        content: c,
        status: "PENDING",
        deviceId: availableDevices[index]?.id || null // Asignar bot si hay disponible
      }))
    });

    // Marcar dispositivos como OCUPADOS para que no se usen en otra orden simultánea
    const assignedDeviceIds = availableDevices.map(d => d.id);
    if (assignedDeviceIds.length > 0) {
      await prisma.device.updateMany({
        where: { id: { in: assignedDeviceIds } },
        data: { status: "OCUPADO" }
      });
    }
  }

  await prisma.publication.update({
    where: { id: publicationId },
    data: { reviewStatus: "APPROVED" }
  });

  revalidatePath("/dashboard/publicaciones");
  return order.id;
}
