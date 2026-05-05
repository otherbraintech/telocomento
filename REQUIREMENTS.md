# Requisitos del Sistema: TeloComento

TeloComento es una plataforma SaaS diseñada para el monitoreo automático de redes sociales (actualmente Facebook) y la respuesta automatizada mediante bots de comentarios, potenciada por IA.

## 1. Requisitos Funcionales

### RF1: Gestión de Monitoreo (Tarjetas)
- El usuario puede crear "Tarjetas de Monitoreo" con palabras clave y contexto.
- El sistema debe permitir activar/desactivar tarjetas para controlar el flujo de datos.
- Se debe mostrar un indicador de cuota (X de Y tarjetas permitidas).

### RF2: Exploración de Hallazgos (Feed)
- Visualización de publicaciones encontradas por el scraper en dos modos: Grid (cuadrícula) y Swipe (estilo Tinder).
- Capacidad de Aprobar o Rechazar publicaciones.
- Atajos de teclado para moderación rápida.

### RF3: Generación de Comentarios (AI)
- Uso de IA (vía OpenRouter/LLM) para generar comentarios basados en el contenido del post y la intención (Positiva/Negativa).
- Los comentarios deben respetar el tono de voz configurado por el usuario.

### RF4: Gestión de Órdenes y Bots
- Al aprobar un post, se crea una "Orden".
- El sistema debe asignar automáticamente dispositivos (bots) disponibles a la orden.
- Seguimiento del estado de la orden: GENERATED, ACTIVATED, IN_PROGRESS, COMPLETED.

### RF5: Administración y Control
- Panel de administración para gestionar usuarios, límites de cuotas y estados de cuenta.
- Gestión global de dispositivos (sincronización con servicio externo).
- Activación manual de cuentas de usuario nuevas.

## 2. Requisitos No Funcionales

### RNF1: Rendimiento (Next.js App Router)
- Uso intensivo de Server Components (RSC) para carga rápida inicial.
- Optimización de imágenes y estados de carga (Skeletons).

### RNF2: Seguridad y Autenticación
- Autenticación robusta vía NextAuth.js.
- Protección de rutas y acciones basada en Roles (USER/ADMIN).
- Comunicación con servicios externos (Bots/Scraper) protegida por API Keys.

### RNF3: Experiencia de Usuario (UX/UI)
- Interfaz moderna basada en Shadcn/UI y Radix UI.
- Soporte nativo para Modo Oscuro.
- Feedback en tiempo real mediante notificaciones (Sonner).

### RNF4: Escalabilidad
- Arquitectura desacoplada de la lógica de scraping y ejecución de bots (vía API REST).
- Manejo de base de datos eficiente con Prisma y PostgreSQL.
