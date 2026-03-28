"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(traducirError(error.message));
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
          ¡Revisa tu correo!
        </h2>
        <p className="text-foreground/60 text-sm">
          Enviamos un link de confirmación a{" "}
          <span className="font-medium text-foreground">{email}</span>. Haz clic
          en el link para activar tu cuenta.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 text-rupe-green text-sm font-medium hover:underline"
        >
          Ir al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-rupe-dark rounded-2xl shadow-lg p-8 border border-rupe-light dark:border-rupe-deep">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Crea tu cuenta
      </h2>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Nombre */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre"
            required
            autoComplete="name"
            className="w-full px-4 py-2.5 rounded-lg border border-rupe-light dark:border-rupe-deep bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-rupe-green transition"
          />
        </div>

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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            autoComplete="new-password"
            minLength={8}
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
          {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
        </button>

        <p className="text-xs text-center text-foreground/40">
          Al registrarte aceptas nuestros términos de uso.
        </p>
      </form>

      {/* Login */}
      <p className="text-center text-sm text-foreground/60 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-rupe-green font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

function traducirError(message: string): string {
  if (message.includes("User already registered"))
    return "Ya existe una cuenta con ese correo.";
  if (message.includes("Password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  if (message.includes("Unable to validate email"))
    return "El correo no es válido.";
  return "No se pudo crear la cuenta. Intenta de nuevo.";
}
