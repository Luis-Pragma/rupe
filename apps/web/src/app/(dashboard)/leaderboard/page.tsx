import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ── Semana actual (lunes 00:00 → ahora) ──
  const now = new Date();
  const day = now.getDay(); // 0=Dom, 1=Lun ...
  const diffLunes = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diffLunes);
  weekStart.setHours(0, 0, 0, 0);

  // ── Actividades de esta semana ──
  const { data: actividades } = await admin
    .from("activities")
    .select("user_id, xp_earned")
    .gte("created_at", weekStart.toISOString());

  // ── Agregar XP por usuario ──
  const xpPorUsuario: Record<string, number> = {};
  for (const a of actividades ?? []) {
    xpPorUsuario[a.user_id] = (xpPorUsuario[a.user_id] ?? 0) + a.xp_earned;
  }

  // ── Top 20 por XP semanal ──
  const topIds = Object.entries(xpPorUsuario)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([id]) => id);

  // ── Info de usuarios ──
  let leaderboard: { id: string; username: string; full_name: string; level: number; xp: number; weeklyXp: number }[] = [];

  if (topIds.length > 0) {
    const { data: usuarios } = await admin
      .from("users")
      .select("id, username, full_name, level, xp")
      .in("id", topIds);

    leaderboard = topIds.map(id => {
      const u = usuarios?.find(u => u.id === id);
      return {
        id,
        username: u?.username ?? "usuario",
        full_name: u?.full_name ?? "Usuario",
        level: u?.level ?? 1,
        xp: u?.xp ?? 0,
        weeklyXp: xpPorUsuario[id] ?? 0,
      };
    });
  }

  // ── Posición del usuario actual ──
  const miPosicion = leaderboard.findIndex(u => u.id === user.id) + 1;
  const miXpSemanal = xpPorUsuario[user.id] ?? 0;

  // ── Datos del usuario actual ──
  const { data: misDatos } = await admin
    .from("users")
    .select("username, full_name, level, xp")
    .eq("id", user.id)
    .single();

  return (
    <LeaderboardClient
      leaderboard={leaderboard}
      userId={user.id}
      miPosicion={miPosicion}
      miXpSemanal={miXpSemanal}
      username={misDatos?.username ?? ""}
      weekStart={weekStart.toISOString()}
    />
  );
}
