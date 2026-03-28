import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: userData }, { data: profileData }, { data: actividades }, { count }] =
    await Promise.all([
      admin.from("users")
        .select("username, full_name, xp, level, streak_days")
        .eq("id", user.id)
        .single(),
      admin.from("profiles")
        .select("tagline")
        .eq("user_id", user.id)
        .single(),
      admin.from("activities")
        .select("id, title, category, xp_earned, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),
      admin.from("activities")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  if (!userData?.username) redirect("/onboarding");

  return (
    <PerfilClient
      fullName={userData.full_name}
      username={userData.username}
      tagline={profileData?.tagline ?? null}
      xp={userData.xp}
      level={userData.level}
      streakDays={userData.streak_days}
      actividades={actividades ?? []}
      totalActividades={count ?? 0}
    />
  );
}
