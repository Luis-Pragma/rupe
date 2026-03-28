"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep"><div className="h-64 animate-pulse bg-rupe-light/20 rounded-lg" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(traducirError(error.message));
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">

      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Inicia sesión
      </h2>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition"
          />
        </div>

        {/* Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground/80"
            >
              Contraseña
            </label>
            <Link
              href="/recuperar-contrasena"
              className="text-xs text-rupe-green hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rupe-green hover:bg-rupe-deep text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {/* Registro */}
      <p className="text-center text-sm text-foreground/60 mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-rupe-green font-medium hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

// Traduce los errores de Supabase al español
function traducirError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (message.includes("Email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión.";
  if (message.includes("Too many requests"))
    return "Demasiados intentos. Espera unos minutos.";
  return "No se pudo iniciar sesión. Intenta de nuevo.";
}
