"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

export async function updateProfile(data: { name: string; username: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      username: data.username
    }
  })

  revalidatePath("/dashboard/perfil")
  return { success: true }
}

export async function updatePassword(password: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")

  const hashedPassword = await hash(password, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: hashedPassword
    }
  })

  return { success: true }
}
