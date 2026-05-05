# Arquitectura Técnica: TeloComento

Este documento describe la estructura interna, el stack tecnológico y los flujos de datos de la plataforma.

## 1. Stack Tecnológico

- **Core**: [Next.js 16](https://nextjs.org/) (App Router).
- **Lenguaje**: TypeScript (Tipado estricto).
- **Base de Datos**: PostgreSQL gestionado con [Prisma ORM](https://www.prisma.io/).
- **Autenticación**: [NextAuth.js v5](https://authjs.dev/).
- **UI/Styling**: Tailwind CSS + [Shadcn/UI](https://ui.shadcn.com/) + Lucide React.
- **IA**: Integración con OpenRouter para modelos de lenguaje.

## 2. Estructura del Proyecto

```text
/app             # Rutas y layouts (App Router)
  /api           # Endpoints de API (Ingesta, Bots, Scraper)
  /dashboard     # Vistas principales del usuario
/components      # Componentes de UI reutilizables
  /ui            # Componentes base (Shadcn)
  /admin         # Componentes específicos de administración
/lib             # Lógica compartida
  /actions       # Server Actions (Mutaciones)
  /ai            # Lógica de generación de texto
  /utils.ts      # Utilidades generales
/prisma          # Esquema de base de datos y migraciones
/public          # Assets estáticos
/types           # Definiciones de tipos globales
```

## 3. Modelo de Datos (Simplificado)

- **User**: Entidad central con límites de cuota (`cardLimit`, `orderLimit`) y rol.
- **ScrapingCard**: Define qué buscar (Keyword + Contexto).
- **Publication**: Hallazgo individual del scraper. Puede ser aprobada o rechazada.
- **Order**: Vincula una publicación aprobada con una intención de respuesta.
- **Comment**: Comentarios individuales generados por IA para una orden.
- **Device**: Representa un bot físico/virtual encargado de publicar los comentarios.

## 4. Flujo de Integración

### A. Ciclo de Scraping
1. La WebApp expone `/api/scraper/cards`.
2. El servicio de Scraping consulta este endpoint para saber qué buscar.
3. El Scraping envía hallazgos a `/api/ingest`.

### B. Ciclo de Bots
1. El usuario aprueba un hallazgo -> Se crea una `Order` con `Comments`.
2. El servicio de Bots consulta `/api/orders/pending`.
3. El Bot publica el comentario y reporta éxito/error vía `PATCH /api/comments/[id]`.

## 5. Decisiones de Diseño

- **Server Actions**: Se prefieren sobre los Route Handlers para mutaciones internas de la aplicación (mejor integración con React y seguridad).
- **RevalidatePath**: Se utiliza para mantener la UI sincronizada sin recargas completas del navegador.
- **Proxy/Middleware**: Manejo centralizado de la sesión y protección de rutas en `proxy.ts`.
