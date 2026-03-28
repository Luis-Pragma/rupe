import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import InsigniasClient from "./InsigniasClient";

export default async function InsigniasPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await admin
    .from("users")
    .select("username, level, xp, streak_days")
    .eq("id", user.id)
    .single();

  const { data: achievements } = await admin
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false });

  const { data: actividadesPorCategoria } = await admin
    .from("activities")
    .select("category")
    .eq("user_id", user.id);

  const conteoCategoria: Record<string, number> = {};
  for (const a of actividadesPorCategoria ?? []) {
    conteoCategoria[a.category] = (conteoCategoria[a.category] ?? 0) + 1;
  }

  return (
    <InsigniasClient
      achievements={achievements ?? []}
      userData={userData ?? { username: "", level: 1, xp: 0, streak_days: 0 }}
      conteoCategoria={conteoCategoria}
    />
  );
}
