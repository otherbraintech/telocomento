import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("X-API-KEY");
    if (apiKey !== process.env.BOTS_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL es requerida" }, { status: 400 });
    }

    const publication = await prisma.publication.findFirst({
      where: { sourceUrl: url },
      select: {
        id: true,
        sourceUrl: true,
        authorName: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        reviewStatus: true,
      }
    });

    if (publication) {
      return NextResponse.json({
        exists: true,
        publication
      }, { status: 200 });
    }

    return NextResponse.json({
      exists: false,
      publication: null
    }, { status: 200 });

  } catch (error) {
    console.error("Error en Publications Check API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
