import { redirect } from "next/navigation";
import { obtenerDatosUsuario } from "./actions";
import ConfiguracionClient from "./ConfiguracionClient";

export default async function ConfiguracionPage() {
  const usuario = await obtenerDatosUsuario();

  if (!usuario) redirect("/login");

  return <ConfiguracionClient usuario={usuario} />;
}
