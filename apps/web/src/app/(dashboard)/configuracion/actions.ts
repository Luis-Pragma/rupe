"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Cerrar sesión ─────────────────────────────────────────────────────────────

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ── Obtener datos del usuario ─────────────────────────────────────────────────

export async function obtenerDatosUsuario() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await admin
    .from("users")
    .select("id, username, full_name, email, bio, location, website")
    .eq("id", user.id)
    .single();

  const { data: profile } = await admin
    .from("profiles")
    .select("tagline")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    ...data,
    tagline: profile?.tagline ?? "",
    email: user.email ?? "",
  };
}

// ── Actualizar perfil ─────────────────────────────────────────────────────────

export async function actualizarPerfil(formData: {
  fullName: string;
  tagline: string;
  bio: string;
  location: string;
  website: string;
}) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { fullName, tagline, bio, location, website } = formData;

  if (!fullName.trim()) return { error: "El nombre no puede estar vacío" };

  await admin.from("users").update({
    full_name: fullName.trim(),
    bio: bio.trim() || null,
    location: location.trim() || null,
    website: website.trim() || null,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);

  await admin.from("profiles").update({
    tagline: tagline.trim() || null,
  }).eq("user_id", user.id);

  revalidatePath("/perfil");
  revalidatePath("/configuracion");
  return { ok: true };
}
