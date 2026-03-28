"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ── Comunidades por defecto ───────────────────────────────────────────────────

const COMUNIDADES_DEFAULT = [
  {
    name: "Creadores de Contenido",
    slug: "contenido",
    description: "Para creadores que construyen su presencia digital, monetizan su conocimiento y crecen en redes.",
    category: "content",
    member_count: 0,
    is_verified: true,
  },
  {
    name: "Finanzas Personales",
    slug: "finanzas",
    description: "Ahorra, invierte y construye libertad financiera desde cero. Comparte tus avances y estrategias.",
    category: "finance",
    member_count: 0,
    is_verified: true,
  },
  {
    name: "Aprendizaje Continuo",
    slug: "aprendizaje",
    description: "Cursos, libros, idiomas, habilidades técnicas. Todo lo que estás aprendiendo para mejorar.",
    category: "learning",
    member_count: 0,
    is_verified: true,
  },
  {
    name: "Red de Contactos",
    slug: "social",
    description: "Networking real, colaboraciones, mentorías y conexiones que impulsan tu carrera.",
    category: "social",
    member_count: 0,
    is_verified: true,
  },
  {
    name: "Salud & Bienestar",
    slug: "salud",
    description: "Rutinas, hábitos, nutrición y bienestar mental. Tu cuerpo es tu herramienta principal.",
    category: "health",
    member_count: 0,
    is_verified: true,
  },
];

// ── Inicializar comunidades si no existen ─────────────────────────────────────

export async function inicializarComunidades(userId: string) {
  const admin = createAdminClient();
  const { data: existing } = await admin.from("communities").select("id").limit(1);
  if (existing && existing.length > 0) return;

  await admin.from("communities").insert(
    COMUNIDADES_DEFAULT.map(c => ({ ...c, created_by: userId }))
  );
}

// ── Obtener todas las comunidades ─────────────────────────────────────────────

export async function obtenerComunidades() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { comunidades: [], unidas: [] };

  await inicializarComunidades(user.id);

  const { data: comunidades } = await admin
    .from("communities")
    .select("*")
    .order("member_count", { ascending: false });

  const { data: unidas } = await admin
    .from("community_members")
    .select("community_id")
    .eq("user_id", user.id);

  return {
    comunidades: comunidades ?? [],
    unidas: (unidas ?? []).map((u: { community_id: string }) => u.community_id),
    userId: user.id,
  };
}

// ── Unirse a una comunidad ────────────────────────────────────────────────────

export async function unirseComunidad(communityId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: existing } = await admin
    .from("community_members")
    .select("community_id")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await admin.from("community_members").insert({
      community_id: communityId,
      user_id: user.id,
      role: "member",
    });

    const { data: comm } = await admin
      .from("communities")
      .select("member_count")
      .eq("id", communityId)
      .single();

    await admin.from("communities")
      .update({ member_count: (comm?.member_count ?? 0) + 1 })
      .eq("id", communityId);
  }

  revalidatePath("/comunidades");
  return { ok: true };
}

// ── Salir de una comunidad ────────────────────────────────────────────────────

export async function salirComunidad(communityId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  await admin.from("community_members")
    .delete()
    .eq("community_id", communityId)
    .eq("user_id", user.id);

  const { data: comm } = await admin
    .from("communities")
    .select("member_count")
    .eq("id", communityId)
    .single();

  await admin.from("communities")
    .update({ member_count: Math.max(0, (comm?.member_count ?? 1) - 1) })
    .eq("id", communityId);

  revalidatePath("/comunidades");
  return { ok: true };
}

// ── Obtener posts de una comunidad ────────────────────────────────────────────

export async function obtenerPosts(communityId: string) {
  const admin = createAdminClient();

  const { data: posts } = await admin
    .from("posts")
    .select("id, content, likes_count, comments_count, created_at, user_id")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!posts || posts.length === 0) return [];

  // Obtener autores
  const userIds = [...new Set(posts.map((p: { user_id: string }) => p.user_id))];
  const { data: autores } = await admin
    .from("users")
    .select("id, username, full_name, level")
    .in("id", userIds);

  const mapaAutores = Object.fromEntries(
    (autores ?? []).map((a: { id: string; username: string; full_name: string; level: number }) => [a.id, a])
  );

  return posts.map((p: {
    id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    user_id: string;
  }) => ({
    ...p,
    autor: mapaAutores[p.user_id] ?? null,
  }));
}

// ── Crear post ────────────────────────────────────────────────────────────────

export async function crearPost(communityId: string, content: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  if (!content.trim()) return { error: "El contenido no puede estar vacío" };

  const { data, error } = await admin.from("posts").insert({
    community_id: communityId,
    user_id: user.id,
    content: content.trim(),
    likes_count: 0,
    comments_count: 0,
  }).select().single();

  if (error) return { error: "No se pudo publicar" };

  revalidatePath("/comunidades");
  return { ok: true, post: data };
}

// ── Reaccionar a un post (toggle) ─────────────────────────────────────────────

export async function reaccionarPost(postId: string, tipo: "like" | "fire" | "clap" | "mind_blown") {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: existing } = await admin
    .from("reactions")
    .select("id, type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: post } = await admin
    .from("posts")
    .select("likes_count")
    .eq("id", postId)
    .single();

  const likes = post?.likes_count ?? 0;

  if (existing) {
    await admin.from("reactions").delete().eq("id", existing.id);
    await admin.from("posts").update({ likes_count: Math.max(0, likes - 1) }).eq("id", postId);
  } else {
    await admin.from("reactions").insert({ post_id: postId, user_id: user.id, type: tipo });
    await admin.from("posts").update({ likes_count: likes + 1 }).eq("id", postId);
  }

  revalidatePath("/comunidades");
  return { ok: true };
}

// ── Obtener comentarios de un post ────────────────────────────────────────────

export async function obtenerComentarios(postId: string) {
  const admin = createAdminClient();

  const { data: comentarios } = await admin
    .from("comments")
    .select("id, content, created_at, user_id")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(30);

  if (!comentarios || comentarios.length === 0) return [];

  const userIds = [...new Set(comentarios.map((c: { user_id: string }) => c.user_id))];
  const { data: autores } = await admin
    .from("users")
    .select("id, username, level")
    .in("id", userIds);

  const mapaAutores = Object.fromEntries(
    (autores ?? []).map((a: { id: string; username: string; level: number }) => [a.id, a])
  );

  return comentarios.map((c: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
  }) => ({
    ...c,
    autor: mapaAutores[c.user_id] ?? null,
  }));
}

// ── Crear comentario ──────────────────────────────────────────────────────────

export async function crearComentario(postId: string, communityId: string, content: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
  if (!content.trim()) return { error: "El comentario no puede estar vacío" };

  await admin.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  });

  const { data: post } = await admin.from("posts").select("comments_count").eq("id", postId).single();
  await admin.from("posts").update({ comments_count: (post?.comments_count ?? 0) + 1 }).eq("id", postId);

  revalidatePath(`/comunidades/${communityId}`);
  return { ok: true };
}

// ── Obtener una comunidad por slug ────────────────────────────────────────────

export async function obtenerComunidadPorSlug(slug: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: comunidad } = await admin
    .from("communities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!comunidad) return { comunidad: null, esMiembro: false, userId: "" };

  let esMiembro = false;
  if (user) {
    const { data: membresia } = await admin
      .from("community_members")
      .select("community_id")
      .eq("community_id", comunidad.id)
      .eq("user_id", user.id)
      .maybeSingle();
    esMiembro = !!membresia;
  }

  return { comunidad, esMiembro, userId: user?.id ?? "" };
}
