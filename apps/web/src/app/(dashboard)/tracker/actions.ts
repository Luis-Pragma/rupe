"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Reglas de XP ─────────────────────────────────────────────────────────────

function getTechoDiario(nivel: number): number {
  if (nivel <= 3) return 300; // Bloque 1 — Arranque
  if (nivel <= 6) return 200; // Bloque 2 — Crecimiento
  if (nivel <= 8) return 150; // Bloque 3 — Consolidación
  return 100;                 // Bloque 4 — Élite
}

function getNivelDesdeXP(xp: number): number {
  if (xp >= 40000) return 10;
  if (xp >= 27000) return 9;
  if (xp >= 18000) return 8;
  if (xp >= 12000) return 7;
  if (xp >= 7500)  return 6;
  if (xp >= 4500)  return 5;
  if (xp >= 2500)  return 4;
  if (xp >= 1200)  return 3;
  if (xp >= 500)   return 2;
  return 1;
}

const XP_BASE_ACTIVIDAD = 50;
const XP_BONUS_PRUEBA   = 20;

// ── Action principal ──────────────────────────────────────────────────────────

export async function registrarActividad(formData: FormData) {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const titulo      = (formData.get("titulo") as string)?.trim();
  const categoria   = formData.get("categoria") as string;
  const descripcion = (formData.get("descripcion") as string)?.trim() || null;
  const prueba      = (formData.get("prueba") as string)?.trim() || null;

  if (!titulo || !categoria) return { error: "Título y categoría son obligatorios" };

  // 1. Obtener datos actuales del usuario
  const { data: userData, error: userErr } = await admin
    .from("users")
    .select("xp, level, streak_days, updated_at")
    .eq("id", user.id)
    .single();

  if (userErr || !userData) return { error: "No se pudo obtener tu perfil" };

  // 2. Calcular XP ganado hoy
  const hoy = new Date().toISOString().split("T")[0];
  const { data: actividadesHoy } = await admin
    .from("activities")
    .select("xp_earned")
    .eq("user_id", user.id)
    .gte("created_at", `${hoy}T00:00:00.000Z`)
    .lte("created_at", `${hoy}T23:59:59.999Z`);

  const xpGanadoHoy = (actividadesHoy ?? []).reduce(
    (sum, a) => sum + (a.xp_earned ?? 0), 0
  );

  const techo = getTechoDiario(userData.level);
  const xpDisponible = Math.max(0, techo - xpGanadoHoy);

  // 3. Calcular XP de esta actividad
  let xpActividad = XP_BASE_ACTIVIDAD;
  if (prueba) xpActividad += XP_BONUS_PRUEBA;
  const xpFinal = Math.min(xpActividad, xpDisponible);

  // 4. Registrar la actividad
  const { error: actErr } = await admin.from("activities").insert({
    user_id:     user.id,
    type:        categoria,
    title:       titulo,
    description: descripcion,
    xp_earned:   xpFinal,
    category:    categoria,
    date:        new Date().toISOString(),
  });

  if (actErr) return { error: "No se pudo registrar la actividad" };

  // 5. Actualizar racha
  const ultimaActualizacion = new Date(userData.updated_at);
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const eraAyer = ultimaActualizacion.toISOString().split("T")[0] === ayer.toISOString().split("T")[0];
  const eraHoy  = ultimaActualizacion.toISOString().split("T")[0] === hoy;

  let nuevaRacha = userData.streak_days;
  if (!eraHoy) {
    nuevaRacha = eraAyer ? userData.streak_days + 1 : 1;
  }

  // 6. Calcular nuevo XP y nivel
  const nuevoXP    = userData.xp + xpFinal;
  const nuevoNivel = getNivelDesdeXP(nuevoXP);

  // 7. Actualizar usuario
  await admin.from("users").update({
    xp:          nuevoXP,
    level:       nuevoNivel,
    streak_days: nuevaRacha,
    updated_at:  new Date().toISOString(),
  }).eq("id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/tracker");

  return {
    ok: true,
    xpGanado:    xpFinal,
    xpTotal:     nuevoXP,
    nivelNuevo:  nuevoNivel > userData.level,
    techoAlcanzado: xpDisponible <= xpActividad,
  };
}

// ── Obtener actividades del usuario ──────────────────────────────────────────

export async function obtenerActividades(limite = 20) {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await admin
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limite);

  return data ?? [];
}

// ── Obtener XP de hoy ─────────────────────────────────────────────────────────

export async function obtenerXPHoy() {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { xpHoy: 0, techo: 300 };

  const { data: userData } = await admin
    .from("users")
    .select("level")
    .eq("id", user.id)
    .single();

  const hoy = new Date().toISOString().split("T")[0];
  const { data: actividades } = await admin
    .from("activities")
    .select("xp_earned")
    .eq("user_id", user.id)
    .gte("created_at", `${hoy}T00:00:00.000Z`);

  const xpHoy = (actividades ?? []).reduce((sum, a) => sum + (a.xp_earned ?? 0), 0);
  const techo = getTechoDiario(userData?.level ?? 1);

  return { xpHoy, techo };
}
