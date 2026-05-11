import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Instanciamos el pool de conexiones de 'pg' (PostgreSQL).
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL no está definida en las variables de entorno.");
} else {
  console.log("🔌 Intentando conectar a la base de datos...");
}

const pool = new Pool({ 
  connectionString,
  max: 10, // Máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentar tiempo de espera de conexión
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// 2. Pasamos el pool al adaptador de Prisma para PostgreSQL
const adapter = new PrismaPg(pool);

// 3. Instanciamos PrismaClient pasando el adaptador (requerido desde Prisma 7 / Prisma 6 con external adaptors)
// Para que esto funcione, el schema.prisma no debe contener la propiedad "url" dentro del "datasource".
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
