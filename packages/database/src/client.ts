import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Este cliente se usa solo en el servidor (Next.js Server Components, API Routes)
// NUNCA exponer DATABASE_URL al cliente

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Revisa tu archivo .env.local"
    );
  }

  const queryClient = postgres(connectionString, {
    max: 1, // Conexiones máximas (importante para serverless)
  });

  return drizzle(queryClient, { schema });
}

// Singleton para evitar múltiples conexiones en desarrollo
declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof createClient> | undefined;
}

export const db = globalThis._db ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis._db = db;
}
