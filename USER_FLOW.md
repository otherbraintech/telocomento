# Flujos de Usuario y Procesos: TeloComento

Este documento visualiza los procesos clave dentro de la plataforma utilizando diagramas de flujo.

## 1. Registro y Activación de Cuenta

```mermaid
graph TD
    A[Usuario se registra] --> B{¿Tiene status ACTIVE?}
    B -- No --> C[Pantalla de Espera: Cuenta en Revisión]
    B -- Sí --> D[Acceso al Dashboard]
    E[Admin revisa usuarios] --> F[Activa cuenta y asigna cuotas]
    F --> D
```

## 2. Ciclo de Monitoreo y Scraping

```mermaid
graph TD
    A[Usuario crea Tarjeta de Monitoreo] --> B[Define Keyword y Contexto]
    B --> C[Scraper externo consulta API]
    C --> D[Búsqueda en Facebook]
    D --> E{¿Hallazgo relevante?}
    E -- Sí --> F[Ingesta vía /api/ingest]
    F --> G[Aparece en 'Explorar Posts' del usuario]
    E -- No --> D
```

## 3. De Hallazgo a Comentario Publicado

```mermaid
graph TD
    A[Usuario revisa el Feed] --> B{¿Aprobar post?}
    B -- Sí --> C[Elegir Intención: Positiva/Negativa]
    C --> D[IA genera comentarios sugeridos]
    D --> E[Se crea la Orden]
    E --> F[Asignación automática de Bots]
    F --> G[Bot consulta API /pending]
    G --> H[Publicación en Facebook]
    H --> I[Reporte de éxito a la WebApp]
    I --> J[Orden completada]
```

## 4. Gestión de Bots (Admin)

```mermaid
graph LR
    A[Servicio Externo] --> B[Sincronizar Dispositivos]
    B --> C{¿Estado?}
    C -- LIBRE --> D[Disponible para Órdenes]
    C -- OCUPADO --> E[Procesando Comentario]
    C -- SIN_CUENTA --> F[Requiere login manual]
```
