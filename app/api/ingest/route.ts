import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get("X-API-KEY");
    
    // Simplificación de validación de API Key (idealmente en base de datos o env var seguro)
    if (apiKey !== process.env.SCRAPER_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { searchFormatId, externalId, content, url, publishDate } = body;

    if (!searchFormatId || !url) {
      return NextResponse.json({ error: "Faltan datos requeridos (searchFormatId, url)" }, { status: 400 });
    }

    // Validar que la tarjeta existe
    const card = await prisma.scrapingCard.findUnique({
      where: { id: searchFormatId }
    });

    if (!card) {
      return NextResponse.json({ error: "Tarjeta de monitoreo no encontrada" }, { status: 404 });
    }

    // Aquí idealmente integraríamos OpenRouter para clasificar el sentimiento en tiempo real
    // const sentiment = await classifySentiment(content);
    // Por ahora lo dejamos por defecto en NEUTRAL, o PENDING de revisión manual.

    const publication = await prisma.publication.create({
      data: {
        scrapingCardId: searchFormatId,
        sourceUrl: url,
        content: content || "",
        publishedAt: publishDate ? new Date(publishDate) : new Date(),
        sentiment: "NEUTRAL",
        reviewStatus: "PENDING"
      }
    });

    return NextResponse.json({ success: true, publication }, { status: 201 });
    
  } catch (error) {
    console.error("Error en Ingest API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
