import { redirect } from "next/navigation";
import { verificarAdmin, obtenerTodosUsuarios, obtenerEstadisticasGenerales } from "./actions";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const esAdmin = await verificarAdmin();
  if (!esAdmin) redirect("/dashboard");

  const [usuarios, stats] = await Promise.all([
    obtenerTodosUsuarios(),
    obtenerEstadisticasGenerales(),
  ]);

  return <AdminClient usuarios={usuarios} stats={stats} />;
}
