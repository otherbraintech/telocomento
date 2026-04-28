"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateComments } from "@/lib/ai/openrouter";
import { syncDevices, getAvailableDevices } from "@/lib/actions/devices";

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

  // Sincronizar dispositivos antes de generar para tener el estado real
  try {
    await syncDevices();
  } catch (e) {
    console.warn("No se pudo sincronizar dispositivos:", e);
  }

  // Obtener todos los dispositivos disponibles (con cuenta social, libres u ocupados)
  const availableDevices = await getAvailableDevices();
  
  // Generar comentarios en base al contenido de la publicación
  // Si no hay dispositivos, igual generamos comentarios pero sin asignar bot
  const commentsToGenerate = Math.max(1, availableDevices.length);
  const aiComments = await generateComments(publication.content || "", intent, notes, commentsToGenerate);

  // Guardarlos en la BD con asignación automática
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
    const assignedDeviceIds = availableDevices.slice(0, aiComments.length).map(d => d.id);
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

export async function createManualPublication(data: {
  sourceUrl: string;
  authorName?: string;
  content?: string;
  imageUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const publication = await prisma.publication.create({
    data: {
      userId: session.user.id,
      sourceUrl: data.sourceUrl,
      authorName: data.authorName,
      content: data.content,
      imageUrl: data.imageUrl,
      publishedAt: new Date(),
      reviewStatus: "APPROVED", // Las manuales se asumen aprobadas
    }
  });

  revalidatePath("/dashboard/posts");
  return publication;
}

export async function updatePublicationAdmin(id: string, data: { sourceUrl: string; authorName?: string; content?: string; reviewStatus: any }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  await prisma.publication.update({
    where: { id },
    data: {
      sourceUrl: data.sourceUrl,
      authorName: data.authorName,
      content: data.content,
      reviewStatus: data.reviewStatus
    }
  });

  revalidatePath("/dashboard/admin/publicaciones");
}

export async function deletePublication(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  await prisma.publication.delete({
    where: { id }
  });

  revalidatePath("/dashboard/admin/publicaciones");
}
