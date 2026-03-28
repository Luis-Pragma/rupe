"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Email del superadmin — solo este usuario puede acceder al panel
const ADMIN_EMAIL = "luis@pragma.mx";

export async function verificarAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === ADMIN_EMAIL;
}

export async function obtenerTodosUsuarios() {
  const admin = createAdminClient();

  const { data: usuarios } = await admin
    .from("users")
    .select("id, username, full_name, email, level, xp, streak_days, is_premium, created_at")
    .order("created_at", { ascending: false });

  if (!usuarios) return [];

  // Obtener conteo de actividades por usuario
  const ids = usuarios.map((u: { id: string }) => u.id);
  const { data: conteos } = await admin
    .from("activities")
    .select("user_id")
    .in("user_id", ids);

  const mapConteos: Record<string, number> = {};
  (conteos ?? []).forEach((a: { user_id: string }) => {
    mapConteos[a.user_id] = (mapConteos[a.user_id] ?? 0) + 1;
  });

  return usuarios.map((u: {
    id: string; username: string; full_name: string; email: string;
    level: number; xp: number; streak_days: number; is_premium: boolean; created_at: string;
  }) => ({
    ...u,
    totalActividades: mapConteos[u.id] ?? 0,
  }));
}

export async function obtenerEstadisticasGenerales() {
  const admin = createAdminClient();

  const [
    { count: totalUsuarios },
    { count: totalActividades },
    { data: topUsuarios },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }),
    admin.from("activities").select("*", { count: "exact", head: true }),
    admin.from("users")
      .select("id, username, full_name, xp, level")
      .order("xp", { ascending: false })
      .limit(3),
  ]);

  return {
    totalUsuarios: totalUsuarios ?? 0,
    totalActividades: totalActividades ?? 0,
    topUsuarios: topUsuarios ?? [],
  };
}
