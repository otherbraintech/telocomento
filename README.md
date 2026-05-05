# TeloComento: Plataforma de Monitoreo y Bots de IA

TeloComento es una solución integral para el monitoreo estratégico de redes sociales y la interacción automatizada mediante bots inteligentes.

## 📚 Documentación del Proyecto

Para entender a fondo cómo funciona la plataforma, consulta los siguientes documentos:

- 📋 **[Requisitos del Sistema](file:///d:/Users/ludwi/Documents/workspace/telocomento-app/REQUIREMENTS.md)**: Alcance funcional y técnico.
- 🏗️ **[Arquitectura Técnica](file:///d:/Users/ludwi/Documents/workspace/telocomento-app/ARCHITECTURE.md)**: Stack tecnológico, estructura de datos e integraciones.
- 🔄 **[Flujos de Usuario](file:///d:/Users/ludwi/Documents/workspace/telocomento-app/USER_FLOW.md)**: Diagramas de procesos (Scraping, Moderación, Bots).
- 🔌 **[Especificación de API](file:///d:/Users/ludwi/Documents/workspace/telocomento-app/API_SPEC.md)**: Endpoints para servicios externos de scraping y bots.

## 🚀 Inicio Rápido

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno en `.env` (usa `.env.example` como base).

3. Inicia la base de datos y genera el cliente de Prisma:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---
Desarrollado con Next.js 16, Prisma y Shadcn/UI.
