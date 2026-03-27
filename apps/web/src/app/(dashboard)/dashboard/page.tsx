import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-rupe-green">
            RUPE
          </h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-foreground/60 hover:text-foreground transition"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Bienvenida */}
        <div className="bg-rupe-light dark:bg-rupe-dark rounded-2xl p-6 border border-rupe-green/20">
          <p className="text-rupe-deep dark:text-rupe-light text-sm font-medium mb-1">
            Bienvenido de vuelta
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {user.user_metadata?.full_name ?? user.email}
          </h2>
          <p className="text-foreground/50 text-sm mt-1">{user.email}</p>
        </div>

        {/* Placeholder de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {["XP Total", "Racha", "Nivel"].map((metric) => (
            <div
              key={metric}
              className="bg-white dark:bg-rupe-dark rounded-xl p-5 border border-rupe-light dark:border-rupe-deep"
            >
              <p className="text-xs text-foreground/50 uppercase tracking-wider mb-2">
                {metric}
              </p>
              <p className="text-3xl font-bold text-rupe-green">—</p>
              <p className="text-xs text-foreground/40 mt-1">
                Pronto disponible
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-foreground/40 text-sm mt-12">
          Dashboard en construcción — RUPE MVP
        </p>
      </div>
    </div>
  );
}
