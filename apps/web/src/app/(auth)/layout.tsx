"use client";

import { useEffect, useState } from "react";
import RupeLogo from "@/components/RupeLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para que la animación de entrada se vea después del splash
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div
        className="w-full max-w-md"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* ── Header con logo real ── */}
        <div className="flex flex-col items-center mb-8 gap-3">
          {/* Logo SVG */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.75)",
              transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
            }}
          >
            <RupeLogo size={90} />
          </div>

          {/* Wordmark */}
          <div
            className="text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
            }}
          >
            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: 12,
                color: "#F0F0EC",
                margin: 0,
              }}
            >
              RUPE
            </h1>

            {/* Barra verde */}
            <div
              style={{
                height: 2,
                backgroundColor: "#63B528",
                borderRadius: 1,
                margin: "6px auto",
                width: visible ? 160 : 0,
                transition: "width 0.5s ease 0.35s",
              }}
            />

            <p
              className="text-sm"
              style={{
                color: "rgba(240,240,236,0.45)",
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              Tu progreso, tu identidad.
            </p>
          </div>
        </div>

        {/* ── Contenido de la página (login / registro / etc) ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
