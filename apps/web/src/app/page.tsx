import { redirect } from "next/navigation";

// El splash screen ahora está en el root layout (SplashOverlay) y aparece en todas las páginas.
// Esta ruta solo redirige al login como punto de entrada.
export default function HomePage() {
  redirect("/login");
}
