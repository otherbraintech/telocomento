import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get("X-API-KEY");
    if (apiKey !== process.env.BOTS_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const typeQuery = searchParams.get("type"); // POSITIVE o NEGATIVE

    // 1. Buscar comentarios pendientes directamente
    const pendingComments = await prisma.comment.findMany({
      where: {
        status: "PENDING",
        deviceId: { not: null },
        order: typeQuery ? { intent: typeQuery as any } : undefined,
      },
      include: {
        device: true,
        order: {
          include: {
            publication: true
          }
        }
      },
      take: 50
    });

    if (pendingComments.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 2. No cambiamos el estado del comentario aquí, se mantiene como PENDING
    // para que el bot service sea el encargado de reportar éxito o error.
    const commentIds = pendingComments.map(c => c.id);

    // 3. Marcar órdenes relacionadas como IN_PROGRESS
    const orderIds = Array.from(new Set(pendingComments.map(c => c.orderId)));
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: "IN_PROGRESS" }
    });

    // 4. Marcar dispositivos como OCUPADO
    const deviceIds = pendingComments
      .map(c => c.deviceId)
      .filter((id): id is string => id !== null);

    if (deviceIds.length > 0) {
      await prisma.device.updateMany({
        where: { id: { in: deviceIds } },
        data: { status: "OCUPADO" }
      });
    }

    // 5. Formatear respuesta plana para n8n
    const response = pendingComments.map((c) => ({
      commentId: c.id,
      orderId: c.orderId,
      content: c.content,
      publicationUrl: c.order.publication.sourceUrl,
      authorName: c.order.publication.authorName,
      deviceSerial: c.device?.serial || null,
      deviceAlias: c.device?.alias || null,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error en Comments API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
