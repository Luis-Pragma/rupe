import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { obtenerActividades, obtenerXPHoy } from "./actions";
import TrackerClient from "./TrackerClient";

export default async function TrackerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [actividades, { xpHoy, techo }] = await Promise.all([
    obtenerActividades(30),
    obtenerXPHoy(),
  ]);

  return (
    <TrackerClient
      actividades={actividades}
      xpHoy={xpHoy}
      techo={techo}
    />
  );
}
