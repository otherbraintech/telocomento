import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scrapingCardId, userId, authorName, content, sourceUrl, imageUrl, publishedAt } = body;

    if ((!scrapingCardId && !userId) || !sourceUrl || !imageUrl) {
      return NextResponse.json({ error: "Faltan datos requeridos (scrapingCardId o userId, sourceUrl, imageUrl)" }, { status: 400 });
    }

    // Validar que la tarjeta o el usuario existen
    if (scrapingCardId) {
      const card = await prisma.scrapingCard.findUnique({
        where: { id: scrapingCardId }
      });
      if (!card) {
        return NextResponse.json({ error: "Tarjeta de monitoreo no encontrada" }, { status: 404 });
      }
    } else if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
    }

    const publication = await prisma.publication.create({
      data: {
        scrapingCardId: scrapingCardId || null,
        userId: userId || null,
        sourceUrl,
        imageUrl,
        authorName: authorName || "Perfil de Facebook",
        content: content || "",
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        reviewStatus: "PENDING"
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Publicación registrada correctamente",
      publicationId: publication.id 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error en Ingest API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
