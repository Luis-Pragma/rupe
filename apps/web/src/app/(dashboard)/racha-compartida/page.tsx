import { obtenerRachasCompartidas } from "./actions";
import RachaCompartidaClient from "./RachaCompartidaClient";

export default async function RachaCompartidaPage() {
  const { rachas, userId, tablaMissing } = await obtenerRachasCompartidas() as {
    rachas: Array<{
      id: string;
      streak_days: number;
      status: string;
      invited_at: string;
      soyInvitador: boolean;
      miUltimaActividad: string | null;
      suUltimaActividad: string | null;
      companero: { id: string; username: string; full_name: string; level: number; streak_days: number } | null;
    }>;
    userId: string;
    tablaMissing?: boolean;
  };

  return (
    <RachaCompartidaClient
      rachas={rachas}
      userId={userId}
      tablaMissing={!!tablaMissing}
    />
  );
}
