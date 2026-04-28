"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTarjeta(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  const keyword = formData.get("keyword") as string;
  const context = formData.get("context") as string;
  
  if (!keyword) {
    return { error: "La palabra clave es obligatoria" };
  }

  try {
    // Verificar límite de tarjetas
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { scrapingCards: true } } }
    });

    if (user && user._count.scrapingCards >= user.cardLimit) {
      return { error: `Has alcanzado el límite de ${user.cardLimit} tarjetas. Contacta al administrador para aumentar tu capacidad.` };
    }

    await prisma.scrapingCard.create({
      data: {
        userId: session.user.id,
        keyword,
        context: context || null,
        status: "ACTIVE",
      },
    });
  } catch (e) {
    console.error("Error creating tarjeta:", e);
    return { error: "Ocurrió un error al crear la tarjeta" };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/tarjetas");
}

export async function toggleTarjetaStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "No autorizado" };
  }

  const cardId = formData.get("cardId") as string;
  const currentStatus = formData.get("currentStatus") as string;

  if (!cardId) return;

  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  try {
    await prisma.scrapingCard.update({
      where: {
        id: cardId,
        userId: session.user.id, // Ensure user owns the card
      },
      data: {
        status: newStatus,
      },
    });
  } catch (error) {
    console.error("Error toggling status:", error);
  }

  // Use revalidatePath or let redirect refresh the page
  redirect("/dashboard/tarjetas");
}

export async function updateTarjeta(cardId: string, data: { keyword: string; context?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const card = await prisma.scrapingCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Tarjeta no encontrada");

  // Si no es el dueño y no es ADMIN, no puede editar
  if (card.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("No tienes permiso para editar esta tarjeta");
  }

  await prisma.scrapingCard.update({
    where: { id: cardId },
    data: {
      keyword: data.keyword,
      context: data.context || null,
    },
  });

  revalidatePath("/dashboard/tarjetas");
  return { success: true };
}

export async function deleteTarjeta(cardId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const card = await prisma.scrapingCard.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Tarjeta no encontrada");

  // Si no es el dueño y no es ADMIN, no puede borrar
  if (card.userId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("No tienes permiso para eliminar esta tarjeta");
  }

  await prisma.scrapingCard.delete({
    where: { id: cardId },
  });

  revalidatePath("/dashboard/tarjetas");
  return { success: true };
}
