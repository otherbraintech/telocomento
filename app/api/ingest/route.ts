import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scrapingCardId, authorName, content, sourceUrl, imageUrl, publishedAt } = body;

    if (!scrapingCardId || !sourceUrl || !imageUrl) {
      return NextResponse.json({ error: "Faltan datos requeridos (scrapingCardId, sourceUrl, imageUrl)" }, { status: 400 });
    }

    // Validar que la tarjeta existe
    const card = await prisma.scrapingCard.findUnique({
      where: { id: scrapingCardId }
    });

    if (!card) {
      return NextResponse.json({ error: "Tarjeta de monitoreo no encontrada" }, { status: 404 });
    }

    const publication = await prisma.publication.create({
      data: {
        scrapingCardId,
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
