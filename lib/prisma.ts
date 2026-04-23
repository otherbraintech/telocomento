import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Instanciamos el pool de conexiones de 'pg' (PostgreSQL).
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

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
