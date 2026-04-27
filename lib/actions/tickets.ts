"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function requestTickets() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      isRequestingTickets: true
    }
  })

  revalidatePath("/dashboard/tarjetas")
  return { success: true }
}

export async function resolveTicketRequest(userId: string, newLimit: number) {
  const session = await auth()
  // Solo administradores (puedes añadir validación de rol aquí)
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      cardLimit: newLimit,
      isRequestingTickets: false
    }
  })

  revalidatePath("/dashboard/admin/usuarios") // Ajusta según la ruta real de admin
  return { success: true }
}
