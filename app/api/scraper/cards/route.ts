import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("X-API-KEY");
    
    if (apiKey !== process.env.SCRAPER_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cards = await prisma.scrapingCard.findMany({
      where: {
        status: "ACTIVE"
      },
      select: {
        id: true,
        keyword: true,
        context: true,
        userId: true
      }
    });

    return NextResponse.json(cards, { status: 200 });
    
  } catch (error) {
    console.error("Error en Scraper Cards API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
