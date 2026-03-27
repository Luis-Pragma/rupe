import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUPE — Tu progreso, tu identidad.",
  description:
    "Registro Unificado de Progreso y Evolución. Plataforma digital que combina seguimiento de progreso personal, red social con comunidades temáticas y desarrollo profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
