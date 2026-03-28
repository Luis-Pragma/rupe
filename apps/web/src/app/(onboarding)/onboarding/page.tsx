"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { guardarPerfil, guardarPrimeraActividad } from "@/lib/actions/onboarding";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Categoria = "content" | "finance" | "learning" | "social" | "health";

const CATEGORIAS: { value: Categoria; label: string; emoji: string }[] = [
  { value: "content", label: "Contenido", emoji: "🎬" },
  { value: "learning", label: "Aprendizaje", emoji: "📚" },
  { value: "social", label: "Social", emoji: "🤝" },
  { value: "finance", label: "Finanzas", emoji: "💰" },
  { value: "health", label: "Salud", emoji: "💪" },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paso 1
  const [username, setUsername] = useState("");
  const [tagline, setTagline] = useState("");

  // Paso 3
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<Categoria | "">("");
  const [descripcion, setDescripcion] = useState("");

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handlePaso1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.set("username", username);
    formData.set("tagline", tagline);

    const result = await guardarPerfil(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setPaso(2);
  }

  async function handlePaso3(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!categoria) {
      setError("Selecciona una categoría.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("titulo", titulo);
    formData.set("categoria", categoria);
    formData.set("descripcion", descripcion);

    const result = await guardarPrimeraActividad(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setPaso(4); // Pantalla de éxito
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Barra de progreso */}
      {paso < 4 && (
        <div className="mb-8">
          <div className="flex justify-between text-xs text-foreground/40 mb-2">
            <span>Paso {paso} de 3</span>
            <span>{Math.round((paso / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-rupe-light dark:bg-rupe-deep rounded-full overflow-hidden">
            <div
              className="h-full bg-rupe-green rounded-full transition-all duration-500"
              style={{ width: `${(paso / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Paso 1: Username ── */}
      {paso === 1 && (
        <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            Elige tu username
          </h2>
          <p className="text-sm text-foreground/50 mb-6">
            Este será tu identidad pública en RUPE. No puedes cambiarlo después.
          </p>

          <form onSubmit={handlePaso1} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Username
              </label>
              <div className="flex items-center border border-rupe-light dark:border-rupe-deep rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rupe-green">
                <span className="px-3 py-2.5 text-foreground/40 bg-rupe-light/50 dark:bg-rupe-deep/30 text-sm border-r border-rupe-light dark:border-rupe-deep">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="tu_username"
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[a-z0-9_]+"
                  className="flex-1 px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none"
                />
              </div>
              <p className="text-xs text-foreground/40 mt-1">
                Solo minúsculas, números y _ (sin espacios)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Tagline{" "}
                <span className="text-foreground/40 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ej: Creador de contenido y emprendedor"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition text-sm"
              />
              <p className="text-xs text-foreground/40 mt-1">
                Una frase corta que describe lo que haces
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || username.length < 3}
              className="w-full bg-rupe-green hover:bg-rupe-deep text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continuar →
            </button>
          </form>
        </div>
      )}

      {/* ── Paso 2: Objetivo ── */}
      {paso === 2 && (
        <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            ¿Cuál es tu objetivo principal?
          </h2>
          <p className="text-sm text-foreground/50 mb-6">
            Esto nos ayuda a personalizar tu experiencia en RUPE.
          </p>

          <div className="space-y-3">
            {[
              { label: "Hacer crecer mis redes sociales", emoji: "📱" },
              { label: "Construir mi marca personal", emoji: "🏆" },
              { label: "Generar ingresos con contenido", emoji: "💵" },
              { label: "Aprender nuevas habilidades", emoji: "🧠" },
              { label: "Conectar con una comunidad", emoji: "🌱" },
            ].map((objetivo) => (
              <button
                key={objetivo.label}
                onClick={() => setPaso(3)}
                className="w-full text-left px-4 py-4 rounded-xl border-2 border-rupe-light dark:border-rupe-deep hover:border-rupe-green hover:bg-rupe-light/30 dark:hover:bg-rupe-green/10 transition group"
              >
                <span className="text-xl mr-3">{objetivo.emoji}</span>
                <span className="text-sm font-medium text-foreground group-hover:text-rupe-green transition">
                  {objetivo.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setPaso(3)}
            className="w-full mt-4 text-sm text-foreground/40 hover:text-foreground/70 transition"
          >
            Saltar este paso →
          </button>
        </div>
      )}

      {/* ── Paso 3: Primera actividad ── */}
      {paso === 3 && (
        <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            Registra tu primera actividad
          </h2>
          <p className="text-sm text-foreground/50 mb-6">
            ¿Qué hiciste hoy para crecer? Gana{" "}
            <span className="text-rupe-amber font-semibold">+50 XP</span> por
            empezar.
          </p>

          <form onSubmit={handlePaso3} className="space-y-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Categoría
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategoria(cat.value)}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 transition text-xs font-medium ${
                      categoria === cat.value
                        ? "border-rupe-green bg-rupe-light/40 dark:bg-rupe-green/10 text-rupe-green"
                        : "border-rupe-light dark:border-rupe-deep text-foreground/60 hover:border-rupe-green/50"
                    }`}
                  >
                    <span className="text-xl mb-1">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                ¿Qué hiciste?
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Grabé un video para TikTok"
                required
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition text-sm"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Detalle{" "}
                <span className="text-foreground/40 font-normal">(opcional)</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Agrega más contexto si quieres..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition text-sm resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !titulo || !categoria}
              className="w-full bg-rupe-green hover:bg-rupe-deep text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Guardando..." : "Completar y ganar +50 XP 🎉"}
            </button>
          </form>
        </div>
      )}

      {/* ── Paso 4: Éxito ── */}
      {paso === 4 && (
        <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep text-center">
          <CheckCircle className="w-16 h-16 text-rupe-green mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            ¡Bienvenido a RUPE, @{username}!
          </h2>
          <p className="text-foreground/50 text-sm mb-2">
            Ganaste tus primeros
          </p>
          <p className="text-4xl font-bold text-rupe-amber mb-6">+50 XP</p>
          <p className="text-foreground/50 text-sm mb-8">
            Tu progreso empieza hoy. Cada día que registres una actividad
            acumulas XP y construyes tu historial.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-rupe-green hover:bg-rupe-deep text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Ver mi dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
