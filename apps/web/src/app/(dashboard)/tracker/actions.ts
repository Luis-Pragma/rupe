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

  // 8. Verificar insignias desbloqueadas
  const insigniasNuevas = await verificarInsignias(user.id, admin, nuevoXP, nuevoNivel, nuevaRacha);

  revalidatePath("/dashboard");
  revalidatePath("/tracker");
  revalidatePath("/insignias");

  return {
    ok: true,
    xpGanado:    xpFinal,
    xpTotal:     nuevoXP,
    nivelNuevo:  nuevoNivel > userData.level,
    techoAlcanzado: xpDisponible <= xpActividad,
    insigniasNuevas,
  };
}

// ── Sistema de insignias ──────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>;

const INSIGNIAS_DEFINICION = [
  // Contenido
  { type: "contenido_1",  title: "Primer Paso Digital",    description: "Registraste tu primera actividad de contenido",    categoria: "content",  umbral: 1,   xpReward: 25 },
  { type: "contenido_7",  title: "Creador Constante",      description: "7 actividades de contenido registradas",           categoria: "content",  umbral: 7,   xpReward: 50 },
  { type: "contenido_14", title: "Creador Semanal",        description: "14 actividades de contenido registradas",          categoria: "content",  umbral: 14,  xpReward: 100 },
  { type: "contenido_30", title: "Creador Mensual",        description: "30 actividades de contenido registradas",          categoria: "content",  umbral: 30,  xpReward: 200 },
  { type: "contenido_50", title: "Maestro del Contenido",  description: "50 actividades de contenido registradas",          categoria: "content",  umbral: 50,  xpReward: 500 },
  // Finanzas
  { type: "finanzas_1",   title: "Primer Peso Consciente", description: "Registraste tu primera actividad financiera",      categoria: "finance",  umbral: 1,   xpReward: 25 },
  { type: "finanzas_7",   title: "Ahorrador",              description: "7 actividades financieras registradas",            categoria: "finance",  umbral: 7,   xpReward: 50 },
  { type: "finanzas_14",  title: "Inversor",               description: "14 actividades financieras registradas",           categoria: "finance",  umbral: 14,  xpReward: 100 },
  { type: "finanzas_30",  title: "Planeador Financiero",   description: "30 actividades financieras registradas",           categoria: "finance",  umbral: 30,  xpReward: 200 },
  { type: "finanzas_50",  title: "Maestro Financiero",     description: "50 actividades financieras registradas",           categoria: "finance",  umbral: 50,  xpReward: 500 },
  // Aprendizaje
  { type: "aprendizaje_1",  title: "Curiosidad Activada",    description: "Registraste tu primera actividad de aprendizaje",   categoria: "learning", umbral: 1,   xpReward: 25 },
  { type: "aprendizaje_7",  title: "Estudioso",              description: "7 actividades de aprendizaje registradas",          categoria: "learning", umbral: 7,   xpReward: 50 },
  { type: "aprendizaje_14", title: "Aprendiz Dedicado",      description: "14 actividades de aprendizaje registradas",         categoria: "learning", umbral: 14,  xpReward: 100 },
  { type: "aprendizaje_30", title: "Maestro del Saber",      description: "30 actividades de aprendizaje registradas",         categoria: "learning", umbral: 30,  xpReward: 200 },
  { type: "aprendizaje_50", title: "Sabio",                  description: "50 actividades de aprendizaje registradas",         categoria: "learning", umbral: 50,  xpReward: 500 },
  // Social
  { type: "social_1",  title: "Primera Conexión",   description: "Registraste tu primera actividad social",        categoria: "social",   umbral: 1,   xpReward: 25 },
  { type: "social_7",  title: "Networker",          description: "7 actividades sociales registradas",             categoria: "social",   umbral: 7,   xpReward: 50 },
  { type: "social_14", title: "Conector",           description: "14 actividades sociales registradas",            categoria: "social",   umbral: 14,  xpReward: 100 },
  { type: "social_30", title: "Líder Social",       description: "30 actividades sociales registradas",            categoria: "social",   umbral: 30,  xpReward: 200 },
  { type: "social_50", title: "Maestro Social",     description: "50 actividades sociales registradas",            categoria: "social",   umbral: 50,  xpReward: 500 },
  // Salud
  { type: "salud_1",  title: "Primer Hábito",        description: "Registraste tu primera actividad de salud",     categoria: "health",   umbral: 1,   xpReward: 25 },
  { type: "salud_7",  title: "Activo",               description: "7 actividades de salud registradas",            categoria: "health",   umbral: 7,   xpReward: 50 },
  { type: "salud_14", title: "Saludable",            description: "14 actividades de salud registradas",           categoria: "health",   umbral: 14,  xpReward: 100 },
  { type: "salud_30", title: "Atleta Mental",        description: "30 actividades de salud registradas",           categoria: "health",   umbral: 30,  xpReward: 200 },
  { type: "salud_50", title: "Maestro del Bienestar", description: "50 actividades de salud registradas",         categoria: "health",   umbral: 50,  xpReward: 500 },
  // Rachas
  { type: "racha_7",  title: "Semana Perfecta",   description: "7 días consecutivos registrando actividades",  categoria: "streak",   umbral: 7,   xpReward: 100 },
  { type: "racha_14", title: "Dos Semanas",        description: "14 días consecutivos registrando actividades", categoria: "streak",   umbral: 14,  xpReward: 200 },
  { type: "racha_30", title: "Mes de Fuego",       description: "30 días consecutivos registrando actividades", categoria: "streak",   umbral: 30,  xpReward: 500 },
  // Niveles
  { type: "nivel_5",  title: "A Medio Camino",  description: "Alcanzaste el nivel 5",  categoria: "level",    umbral: 5,  xpReward: 200 },
  { type: "nivel_10", title: "Ecosistema",       description: "Alcanzaste el nivel 10", categoria: "level",    umbral: 10, xpReward: 1000 },
];

async function verificarInsignias(
  userId: string,
  admin: AdminClient,
  nuevoXP: number,
  nuevoNivel: number,
  nuevaRacha: number
): Promise<string[]> {
  try {
    // Obtener insignias ya desbloqueadas
    const { data: yaDesbloqueadas } = await admin
      .from("achievements")
      .select("type")
      .eq("user_id", userId);

    const tiposDesbloqueados = new Set((yaDesbloqueadas ?? []).map((a: { type: string }) => a.type));

    // Contar actividades por categoría
    const { data: actividadesPorCategoria } = await admin
      .from("activities")
      .select("category")
      .eq("user_id", userId);

    const conteoCategoria: Record<string, number> = {};
    for (const a of actividadesPorCategoria ?? []) {
      conteoCategoria[a.category] = (conteoCategoria[a.category] ?? 0) + 1;
    }

    const nuevas: string[] = [];

    for (const insignia of INSIGNIAS_DEFINICION) {
      if (tiposDesbloqueados.has(insignia.type)) continue;

      let cumple = false;
      if (insignia.categoria === "streak") {
        cumple = nuevaRacha >= insignia.umbral;
      } else if (insignia.categoria === "level") {
        cumple = nuevoNivel >= insignia.umbral;
      } else {
        cumple = (conteoCategoria[insignia.categoria] ?? 0) >= insignia.umbral;
      }

      if (cumple) {
        await admin.from("achievements").insert({
          user_id:     userId,
          type:        insignia.type,
          title:       insignia.title,
          description: insignia.description,
          xp_reward:   insignia.xpReward,
        });

        // Dar XP bonus por la insignia
        await admin.from("users")
          .update({ xp: nuevoXP + insignia.xpReward })
          .eq("id", userId);

        nuevas.push(insignia.title);
      }
    }

    return nuevas;
  } catch {
    return [];
  }
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
