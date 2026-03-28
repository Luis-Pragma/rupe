import { createClient } from "@supabase/supabase-js";

// Cliente con permisos de administrador — SOLO usar en Server Actions y rutas de servidor
// NUNCA importar este archivo en componentes del cliente
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
