import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: userData }, { data: actividadesRecientes }] = await Promise.all([
    admin.from("users").select("username, full_name, xp, level, streak_days").eq("id", user.id).single(),
    admin.from("activities").select("id, title, category, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  if (!userData?.username) redirect("/onboarding");

  // Contar actividades de hoy
  const hoy = new Date().toISOString().split("T")[0];
  const actividadesHoy = (actividadesRecientes ?? []).filter(
    a => a.created_at.startsWith(hoy)
  ).length;

  return (
    <DashboardClient
      fullName={userData.full_name}
      username={userData.username}
      xp={userData.xp}
      level={userData.level}
      streakDays={userData.streak_days}
      actividadesHoy={actividadesHoy}
      actividadesRecientes={actividadesRecientes ?? []}
    />
  );
}
