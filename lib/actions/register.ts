"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !username || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    // Verificar si el email ya existe
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return { error: "Este correo electrónico ya está registrado." };
    }

    // Verificar si el username ya existe
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return { error: "Este nombre de usuario ya está en uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Si es el primer usuario, lo hacemos ADMIN
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "USER";

    // Crear usuario
    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: role as any,
        status: userCount === 0 ? "ACTIVE" : "INACTIVE"
      }
    });

    return { success: true, email, password };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." };
  }
}
