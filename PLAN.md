# Plan de Implementación: Personalización de Perfiles y Gestión de Scraper

Este plan detalla los pasos para permitir que los usuarios configuren una biografía que será utilizada por un servicio de scraping externo para encontrar contenido relevante en Facebook.

## 1. Modificaciones de Base de Datos (Prisma)
- [x] Agregar campo `bio` (String @db.Text) al modelo `User`.
- [x] Establecer `cardLimit` por defecto en `0` para nuevos usuarios.
- [x] Actualizar el modelo `Publication`:
    - [x] Hacer `scrapingCardId` opcional.
    - [x] Agregar `userId` opcional.
    - [x] Establecer relación entre `Publication` y `User`.

## 2. Gestión de Perfil de Usuario (Dashboard)
- [x] Actualizar Server Action `updateProfile` para soportar el campo `bio`.
- [x] Modificar componente `ProfileForm` para incluir un `Textarea` para la biografía.
- [x] Crear `ProfileSetupDialog`: Diálogo forzado para completar nombre y biografía al primer ingreso (o si faltan datos).
- [x] Integrar `ProfileSetupDialog` en `DashboardLayout`.
- [x] Añadir feedback visual sobre cómo se usa la biografía para el scraping.

## 3. Sistema de Solicitud de Cuota (Tickets)
- [x] Agregar campo `isRequestingTickets` al modelo `User`.
- [x] Crear Server Action `requestTickets` para que el usuario pida más capacidad.
- [x] Crear componente `RequestTicketsButton` para la página de tarjetas.
- [x] Mostrar botón de solicitud automáticamente cuando el usuario llega a su límite de tarjetas.
- [x] Actualizar panel de administración de usuarios para resaltar quiénes están solicitando tickets.

## 4. Integración con Scraper Externo (API)
- [x] Unificar endpoints en GET `/api/scraper/cards`:
    - Retorna tanto Tarjetas de Monitoreo (`type: CARD`) como Perfiles de Usuario (`type: PROFILE`).
    - Formato unificado con `query` (nombre o keyword) y `context` (bio o contexto).
- [x] Actualizar endpoint POST `/api/ingest`:
    - Permitir recibir `userId` en lugar de `scrapingCardId`.
    - Vincular hallazgos directamente al usuario si vienen del scraping de perfil.

## 4. Próximos Pasos (Planificación Continua)
- [ ] **Módulo de Publicaciones**: Actualizar la vista de revisión para mostrar si una publicación viene de una "Tarjeta" o de un "Perfil Personal".
- [ ] **Módulo de Órdenes**: Asegurar que las órdenes creadas desde publicaciones de perfil se vinculen correctamente al usuario.
- [ ] **Optimización de Scraping**: Implementar un webhook o sistema de notificaciones para cuando el scraper termine de procesar un perfil.
- [ ] **Documentación API**: Crear un archivo de especificación para el servicio externo (ej. `API_SPEC.md`).

## 5. Pruebas y Validación
- [ ] Probar el guardado de biografía en el perfil.
- [ ] Validar el endpoint `/api/scraper/profiles` mediante CURL.
- [ ] Simular ingesta de datos vinculados a un `userId`.
