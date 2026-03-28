"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Obtener rachas compartidas del usuario ────────────────────────────────────

export async function obtenerRachasCompartidas() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { rachas: [], userId: "" };

  // Verificar si la tabla existe
  const { data: rachas, error } = await admin
    .from("shared_streaks")
    .select("*")
    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    // La tabla no existe aún
    return { rachas: [], userId: user.id, tablaMissing: true };
  }

  if (!rachas || rachas.length === 0) return { rachas: [], userId: user.id };

  // Obtener datos de los compañeros
  const companeroIds = rachas.map((r: { user_id_1: string; user_id_2: string }) =>
    r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1
  );

  const { data: companeros } = await admin
    .from("users")
    .select("id, username, full_name, level, streak_days")
    .in("id", companeroIds);

  const mapaCompaneros = Object.fromEntries(
    (companeros ?? []).map((c: { id: string; username: string; full_name: string; level: number; streak_days: number }) => [c.id, c])
  );

  const rachasConCompanero = rachas.map((r: {
    id: string;
    user_id_1: string;
    user_id_2: string;
    streak_days: number;
    status: string;
    last_activity_1: string | null;
    last_activity_2: string | null;
    invited_at: string;
  }) => {
    const companeroId = r.user_id_1 === user.id ? r.user_id_2 : r.user_id_1;
    const esUser1 = r.user_id_1 === user.id;
    return {
      ...r,
      companero: mapaCompaneros[companeroId] ?? null,
      miUltimaActividad: esUser1 ? r.last_activity_1 : r.last_activity_2,
      suUltimaActividad: esUser1 ? r.last_activity_2 : r.last_activity_1,
      soyInvitador: esUser1,
    };
  });

  return { rachas: rachasConCompanero, userId: user.id };
}

// ── Invitar a un usuario a compartir racha ────────────────────────────────────

export async function invitarRachaCompartida(usernameObjetivo: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Buscar el usuario objetivo
  const { data: objetivo } = await admin
    .from("users")
    .select("id, username")
    .eq("username", usernameObjetivo.replace("@", ""))
    .maybeSingle();

  if (!objetivo) return { error: "Usuario no encontrado" };
  if (objetivo.id === user.id) return { error: "No puedes invitarte a ti mismo" };

  // Verificar si ya existe una racha compartida
  const { data: existing } = await admin
    .from("shared_streaks")
    .select("id, status")
    .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${objetivo.id}),and(user_id_1.eq.${objetivo.id},user_id_2.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === "active") return { error: "Ya tienen una racha activa juntos" };
    if (existing.status === "pending") return { error: "Ya enviaste una invitación a este usuario" };
  }

  const { error } = await admin.from("shared_streaks").insert({
    user_id_1: user.id,
    user_id_2: objetivo.id,
    streak_days: 0,
    status: "pending",
  });

  if (error) return { error: "No se pudo enviar la invitación" };

  revalidatePath("/racha-compartida");
  return { ok: true, companero: objetivo.username };
}

// ── Aceptar invitación ────────────────────────────────────────────────────────

export async function aceptarInvitacion(rachaId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await admin.from("shared_streaks")
    .update({ status: "active" })
    .eq("id", rachaId)
    .eq("user_id_2", user.id); // Solo el invitado puede aceptar

  revalidatePath("/racha-compartida");
  return { ok: true };
}

// ── Rechazar / cancelar invitación ────────────────────────────────────────────

export async function cancelarRacha(rachaId: string) {
  const admin = createAdminClient();
  await admin.from("shared_streaks").delete().eq("id", rachaId);
  revalidatePath("/racha-compartida");
  return { ok: true };
}

// ── Actualizar actividad en rachas compartidas (llamar desde tracker) ─────────

export async function actualizarRachasCompartidas(userId: string) {
  const admin = createAdminClient();

  const { data: rachas } = await admin
    .from("shared_streaks")
    .select("*")
    .eq("status", "active")
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

  if (!rachas || rachas.length === 0) return;

  const hoy = new Date().toISOString().split("T")[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  for (const racha of rachas) {
    const esUser1 = racha.user_id_1 === userId;
    const campo = esUser1 ? "last_activity_1" : "last_activity_2";
    const otroCampo = esUser1 ? "last_activity_2" : "last_activity_1";

    const otraActividad = racha[otroCampo];
    const otraFecha = otraActividad ? otraActividad.split("T")[0] : null;

    // ¿El otro también registró hoy o ayer?
    let nuevoStreak = racha.streak_days;
    if (otraFecha === hoy || otraFecha === ayer) {
      nuevoStreak = racha.streak_days + 1;
    }

    await admin.from("shared_streaks")
      .update({
        [campo]: new Date().toISOString(),
        streak_days: nuevoStreak,
      })
      .eq("id", racha.id);
  }
}
