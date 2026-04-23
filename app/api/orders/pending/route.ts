import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeQuery = searchParams.get("type"); // POSITIVE o NEGATIVE

    // Idealmente usar autenticación con API KEY para los bots
    const apiKey = req.headers.get("X-API-KEY");
    if (apiKey !== process.env.BOTS_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const whereClause: any = {
      status: "ACTIVATED", // Solo ordenes que ya estén listas para ejecutarse
    };

    if (typeQuery === "POSITIVE" || typeQuery === "NEGATIVE") {
      whereClause.intent = typeQuery;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        publication: true,
        comments: {
          where: { status: "PENDING" } // Solo enviar comentarios no publicados
        }
      },
      take: 10 // Limitar cuántas se envían a los bots por vez
    });

    // Marcar como IN_PROGRESS
    if (orders.length > 0) {
      const orderIds = orders.map((o: any) => o.id);
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "IN_PROGRESS" }
      });
    }

    // Formatear respuesta según la documentación
    const response = orders.map((order: any) => ({
      orderId: order.id,
      publicationUrl: order.publication.sourceUrl,
      comments: order.comments.map((c: any) => ({
        id: c.id,
        content: c.content
      }))
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en Orders API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
