# Especificación de API: TeloComento

Este documento detalla los endpoints utilizados por los servicios externos (Scraper y Bots) para interactuar con la plataforma.

## Autenticación
Todas las peticiones deben incluir el header `X-API-KEY`.
`X-API-KEY: super-secreto-123` (Configurable en el entorno).

---

## 1. Módulo de Scraping

### A. Obtener Objetivos de Scraping
Retorna la lista de palabras clave (Tarjetas) y perfiles de usuario que el scraper debe rastrear.

**Endpoint:** `GET /api/scraper/cards`

**Respuesta (200 OK):**
```json
[
  {
    "id": "card_123",
    "type": "CARD",
    "query": "Venta de autos",
    "context": "Solo autos deportivos en CDMX"
  },
  {
    "id": "user_456",
    "type": "PROFILE",
    "query": "Juan Pérez",
    "context": "Perfil personal de un emprendedor..."
  }
]
```

### B. Ingesta de Hallazgos
El scraper envía las publicaciones encontradas.

**Endpoint:** `POST /api/ingest`

**Body:**
```json
{
  "scrapingCardId": "card_123", // Opcional si se usa userId
  "userId": "user_456",        // Opcional si se usa scrapingCardId
  "sourceUrl": "https://facebook.com/...",
  "authorName": "Nombre del Autor",
  "content": "Texto de la publicación...",
  "imageUrl": "https://...",
  "publishedAt": "2024-05-01T10:00:00Z"
}
```

---

## 2. Módulo de Bots

### A. Comentarios Pendientes
Retorna comentarios listos para ser publicados con bot asignado.

**Endpoint:** `GET /api/orders/pending`

**Respuesta (200 OK):**
```json
[
  {
    "commentId": "comm_789",
    "orderId": "order_001",
    "content": "¡Qué buen post!",
    "publicationUrl": "https://facebook.com/...",
    "deviceSerial": "SN123456",
    "deviceAlias": "Bot-1"
  }
]
```

### B. Reporte de Ejecución
Actualiza el estado de un comentario después del intento de publicación.

**Endpoint:** `PATCH /api/comments/:id`

**Body:**
```json
{
  "status": "PUBLISHED" | "ERROR",
  "errorDetails": "Opcional: mensaje de error si falló"
}
```

---

## Estados de Comentario
- `PENDING`: Generado, esperando bot.
- `SENT`: Tomado por un bot (en proceso).
- `PUBLISHED`: Confirmado en la red social.
- `ERROR`: Falló la publicación.

## Notas de Seguridad
- El acceso está restringido por IP si se configura en el firewall.
- Las URLs de imágenes deben ser accesibles públicamente o vía proxy configurado.
