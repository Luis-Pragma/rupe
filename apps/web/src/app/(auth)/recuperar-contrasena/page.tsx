"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/nueva-contrasena`,
      });

      if (error) {
        setError("No se pudo enviar el correo. Verifica la dirección.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep text-center">
        <CheckCircle className="w-16 h-16 text-rupe-green mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Revisa tu correo
        </h2>
        <p className="text-foreground/60 text-sm">
          Si existe una cuenta con{" "}
          <span className="font-medium text-foreground">{email}</span>, recibirás
          un link para restablecer tu contraseña.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-rupe-green text-sm font-medium hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Recupera tu contraseña
      </h2>
      <p className="text-sm text-foreground/60 mb-6">
        Ingresa tu correo y te enviaremos un link para crear una nueva
        contraseña.
      </p>

      <form onSubmit={handleReset} className="space-y-4">
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

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rupe-green hover:bg-rupe-deep text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Enviando..." : "Enviar link de recuperación"}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/60 mt-6">
        <Link href="/login" className="text-rupe-green font-medium hover:underline">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
