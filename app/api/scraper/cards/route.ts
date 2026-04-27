import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  
  // Validación simple de API Key (puedes mover esto a una variable de entorno .env)
  if (apiKey !== "scraper_key_123") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 1. Obtener Tarjetas de Monitoreo activas
    const cards = await prisma.scrapingCard.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        keyword: true,
        context: true,
        userId: true,
      }
    });

    // 2. Obtener Perfiles de Usuario activos con biografía (solo rol USER)
    const profiles = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        role: "USER",
        bio: {
          not: null,
          notIn: [""]
        },
        name: {
          not: null,
          notIn: [""]
        }
      },
      select: {
        id: true,
        name: true,
        bio: true,
      }
    });

    // 3. Unificar en una lista de tareas para el scraper manteniendo el formato anterior
    const tasks = [
      ...cards.map(card => ({
        id: card.id,
        keyword: card.keyword,
        context: card.context,
        userId: card.userId,
        status: "ACTIVE",
        type: "CARD" // Opcional, para que el scraper sepa si es card o perfil
      })),
      ...profiles.map(profile => ({
        id: profile.id,
        keyword: profile.name,
        context: profile.bio,
        userId: profile.id,
        status: "ACTIVE",
        type: "PROFILE"
      }))
    ];

    return NextResponse.json(tasks, { status: 200 });
    
  } catch (error) {
    console.error("Error en Master Scraper API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
