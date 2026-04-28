# Especificación de API para Bots

Este documento detalla los endpoints utilizados por el servicio externo de bots para obtener y actualizar el estado de los comentarios.

## Autenticación
Todas las peticiones deben incluir el header `X-API-KEY`.
`X-API-KEY: super-secreto-123` (Valor configurado en `BOTS_API_KEY`)

---

## 1. Obtener Comentarios Pendientes
Retorna una lista de comentarios que están listos para ser publicados y tienen un dispositivo asignado.

**Endpoint:** `GET /api/orders/pending`

**Query Params:**
- `type` (opcional): `POSITIVE` o `NEGATIVE` para filtrar por intención de la orden.

**Respuesta (200 OK):**
```json
[
  {
    "commentId": "cmohxktop0001mslh5cnfu7xt",
    "orderId": "cmohxkrji0000mslh3s5ifs3b",
    "content": "Contenido del comentario...",
    "publicationUrl": "https://www.facebook.com/share/v/...",
    "deviceSerial": "ce02171298a9940704",
    "deviceAlias": "Teléfono 940704"
  }
]
```

> [!NOTE]
> Solo se retornan comentarios que tienen un `deviceId` (bot) asignado. Si una orden tiene comentarios sin bot, estos no se incluirán en la respuesta.

---

## 2. Actualizar Estado de Comentario
Actualiza el estado de un comentario después de intentar publicarlo.

**Endpoint:** `PATCH /api/comments/:id`

**Body:**
```json
{
  "status": "PUBLISHED" | "ERROR"
}
```

**Comportamiento:**
- Si el estado es `PUBLISHED`, se registra la fecha en `commentedAt`.
- Si el dispositivo no tiene más comentarios pendientes, se marca como `LIBRE`.
- Si todos los comentarios de una orden se han procesado, la orden se marca como `COMPLETED`.

---

## Estados de Comentario
- `PENDING`: Generado y esperando ser enviado al bot.
- `SENT`: Enviado al servicio de bots (marcado automáticamente al hacer GET).
- `PUBLISHED`: Confirmado como publicado por el bot.
- `ERROR`: Falló el intento de publicación.
