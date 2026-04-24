"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateComments } from "@/lib/ai/openrouter";

export async function generateOrderComments(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { publication: true }
  });

  if (!order) throw new Error("Orden no encontrada");

  // Generar comentarios en base al contenido de la publicación
  const aiComments = await generateComments(
    order.publication.content || "", 
    order.intent, 
    order.notes || "", 
    5
  );
  
  // Guardarlos en la BD
  if (aiComments.length > 0) {
    // Primero limpiar si había alguno
    await prisma.comment.deleteMany({ where: { orderId } });

    await prisma.comment.createMany({
      data: aiComments.map(c => ({
        orderId,
        content: c,
        status: "PENDING"
      }))
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "GENERATED" }
    });
  }

  revalidatePath("/dashboard/ordenes");
}

export async function startOrder(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "IN_PROGRESS" }
  });
  revalidatePath("/dashboard/ordenes");
}

export async function stopOrder(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "STOPPED" }
  });
  revalidatePath("/dashboard/ordenes");
}

export async function cancelOrder(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });
  revalidatePath("/dashboard/ordenes");
}
