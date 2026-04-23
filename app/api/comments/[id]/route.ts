import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = id;
    const apiKey = req.headers.get("X-API-KEY");
    if (apiKey !== process.env.BOTS_API_KEY) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { status, botId } = body;

    if (!status) {
      return NextResponse.json({ error: "El estado es requerido" }, { status: 400 });
    }



    // Actualizar el estado del comentario
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { 
        status: status,
        commentedAt: status === "PUBLISHED" ? new Date() : undefined
      }
    });

    // Validar si la orden ya completó todos sus comentarios
    const pendingCommentsCount = await prisma.comment.count({
      where: {
        orderId: comment.orderId,
        status: "PENDING"
      }
    });

    if (pendingCommentsCount === 0) {
      await prisma.order.update({
        where: { id: comment.orderId },
        data: { status: "COMPLETED" }
      });
    }

    return NextResponse.json({ success: true, comment }, { status: 200 });

  } catch (error) {
    console.error("Error en Comments Update API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
