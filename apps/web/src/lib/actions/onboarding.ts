"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

// ─── Paso 1: Guardar username y tagline ──────────────────────────────────────

export async function guardarPerfil(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = formData.get("username") as string;
  const tagline = formData.get("tagline") as string;

  if (!username || username.length < 3) {
    return { error: "El username debe tener al menos 3 caracteres." };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Solo letras minúsculas, números y guión bajo (_)." };
  }

  try {
    // Verificar que el username no esté tomado
    const { data: existente } = await admin
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existente) {
      return { error: "Ese username ya está en uso. Elige otro." };
    }

    // Insertar en la tabla users
    const { error: userError } = await admin.from("users").upsert({
      id: user.id,
      email: user.email!,
      username,
      full_name: user.user_metadata?.full_name ?? username,
      level: 1,
      xp: 0,
      streak_days: 0,
      is_premium: false,
    });

    if (userError) {
      console.error("Error guardando usuario:", userError);
      return { error: "No se pudo guardar el perfil. Intenta de nuevo." };
    }

    // Insertar en la tabla profiles
    const { error: profileError } = await admin.from("profiles").upsert({
      user_id: user.id,
      handle: username,
      tagline: tagline || null,
      visibility: "public",
    });

    if (profileError) {
      console.error("Error guardando profile:", profileError);
      return { error: "No se pudo guardar el perfil. Intenta de nuevo." };
    }

    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Ocurrió un error inesperado." };
  }
}

// ─── Paso 3: Guardar primera actividad y dar XP ───────────────────────────────

export async function guardarPrimeraActividad(formData: FormData) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const titulo = formData.get("titulo") as string;
  const categoria = formData.get("categoria") as string;
  const descripcion = formData.get("descripcion") as string;

  if (!titulo || !categoria) {
    return { error: "Por favor completa los campos obligatorios." };
  }

  try {
    const XP_PRIMERA_ACTIVIDAD = 50;

    // Insertar actividad
    const { error: actError } = await admin.from("activities").insert({
      user_id: user.id,
      type: categoria,
      title: titulo,
      description: descripcion || null,
      xp_earned: XP_PRIMERA_ACTIVIDAD,
      category: categoria,
    });

    if (actError) {
      console.error("Error guardando actividad:", actError);
      return { error: "No se pudo guardar la actividad." };
    }

    // Dar XP al usuario
    await admin
      .from("users")
      .update({ xp: XP_PRIMERA_ACTIVIDAD })
      .eq("id", user.id);

    return { success: true };
  } catch (e) {
    console.error("Error inesperado:", e);
    return { error: "Ocurrió un error inesperado." };
  }
}
