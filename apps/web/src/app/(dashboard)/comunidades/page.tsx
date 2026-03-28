import { obtenerComunidades } from "./actions";
import ComunidadesClient from "./ComunidadesClient";

export default async function ComunidadesPage() {
  const { comunidades, unidas, userId } = await obtenerComunidades();

  return (
    <ComunidadesClient
      comunidades={comunidades}
      comunidadesUnidas={unidas}
      userId={userId}
    />
  );
}
