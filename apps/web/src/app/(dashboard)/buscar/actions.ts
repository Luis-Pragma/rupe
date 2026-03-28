"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function buscarUsuarios(query: string) {
  if (!query.trim() || query.trim().length < 2) return [];

  const admin = createAdminClient();
  const q = query.trim().toLowerCase();

  const { data } = await admin
    .from("users")
    .select("id, username, full_name, level, xp, streak_days")
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
    .order("xp", { ascending: false })
    .limit(20);

  return data ?? [];
}
