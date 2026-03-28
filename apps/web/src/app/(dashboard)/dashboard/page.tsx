import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await admin
    .from("users")
    .select("username, full_name, xp, level, streak_days")
    .eq("id", user.id)
    .single();

  if (!userData?.username) redirect("/onboarding");

  return (
    <DashboardClient
      fullName={userData.full_name}
      username={userData.username}
      xp={userData.xp}
      level={userData.level}
      streakDays={userData.streak_days}
    />
  );
}
