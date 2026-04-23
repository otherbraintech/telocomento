"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleUserStatus(userId: string, currentStatus: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado")

  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"

  await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus as any }
  })

  revalidatePath("/dashboard/usuarios")
}

export async function updateUserLimit(userId: string, limit: number) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado")

  await prisma.user.update({
    where: { id: userId },
    data: { cardLimit: limit }
  })

  revalidatePath("/dashboard/usuarios")
}

export async function createUser(data: any) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado")

  const { name, username, email, password, role, status, cardLimit } = data

  const { hash } = await import("bcryptjs")
  const hashedPassword = await hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      role: role as any,
      status: status as any,
      cardLimit: parseInt(cardLimit) || 10
    }
  })

  revalidatePath("/dashboard/usuarios")
}

export async function updateUser(userId: string, data: any) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado")

  const { name, role, status, cardLimit } = data

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role: role as any,
      status: status as any,
      cardLimit: parseInt(cardLimit) || 10
    }
  })

  revalidatePath("/dashboard/usuarios")
}

export async function deleteUser(userId: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado")
  
  // No permitir que un admin se borre a sí mismo
  if (session.user.id === userId) throw new Error("No puedes borrarte a ti mismo")

  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath("/dashboard/usuarios")
}
