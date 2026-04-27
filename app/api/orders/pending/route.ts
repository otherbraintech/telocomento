import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeQuery = searchParams.get("type"); // POSITIVE o NEGATIVE

    const apiKey = req.headers.get("X-API-KEY");
    if (apiKey !== process.env.BOTS_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const whereClause: Record<string, unknown> = {
      status: "ACTIVATED",
    };

    if (typeQuery === "POSITIVE" || typeQuery === "NEGATIVE") {
      whereClause.intent = typeQuery;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        publication: true,
        comments: {
          where: { status: "PENDING" },
          include: { device: true },
        }
      },
      take: 10
    });

    // Marcar como IN_PROGRESS
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "IN_PROGRESS" }
      });

      // Marcar dispositivos como OCUPADO
      const deviceIds = orders
        .flatMap((o) => o.comments)
        .map((c) => c.deviceId)
        .filter((id): id is string => id !== null);

      if (deviceIds.length > 0) {
        await prisma.device.updateMany({
          where: { id: { in: deviceIds } },
          data: { status: "OCUPADO" },
        });
      }
    }

    // Formatear respuesta incluyendo info del dispositivo
    const response = orders.map((order) => ({
      orderId: order.id,
      publicationUrl: order.publication.sourceUrl,
      comments: order.comments.map((c) => ({
        id: c.id,
        content: c.content,
        deviceSerial: c.device?.serial || null,
        deviceAlias: c.device?.alias || null,
      }))
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en Orders API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
