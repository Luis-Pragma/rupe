import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import PerfilClient from "@/app/(dashboard)/perfil/PerfilClient";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("full_name, username")
    .eq("username", username)
    .single();

  if (!data) return { title: "Perfil no encontrado — RUPE" };
  return {
    title: `${data.full_name} (@${data.username}) — RUPE`,
    description: `Ve el progreso real de ${data.full_name} en RUPE.`,
  };
}

export default async function PerfilPublicoPage({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();

  // Primero obtenemos el usuario por username
  const { data: userData } = await admin
    .from("users")
    .select("id, username, full_name, xp, level, streak_days")
    .eq("username", username)
    .single();

  if (!userData) notFound();

  // Con el ID real, obtenemos el resto en paralelo
  const [{ data: profile }, { data: actividades }, { count }] = await Promise.all([
    admin.from("profiles").select("tagline").eq("user_id", userData.id).maybeSingle(),
    admin.from("activities")
      .select("id, title, category, xp_earned, created_at")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.id),
  ]);

  return (
    <PerfilClient
      fullName={userData.full_name}
      username={userData.username}
      tagline={profile?.tagline ?? null}
      xp={userData.xp}
      level={userData.level}
      streakDays={userData.streak_days}
      actividades={actividades ?? []}
      totalActividades={count ?? 0}
      esPublico
    />
  );
}
