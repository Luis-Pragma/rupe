"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [salida, setSalida] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSalida(true), 3000);
    const t2 = setTimeout(() => router.push("/login"), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [router]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      backgroundColor: "#0D1117",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 28,
      opacity: salida ? 0 : 1,
      transform: salida ? "scale(1.03)" : "scale(1)",
      transition: salida ? "opacity 0.6s ease, transform 0.6s ease" : "none",
    }}>

      {/* ── Ícono ── */}
      <div style={{ width: 180, height: 180, position: "relative" }}>

        {/* Glow ring — pulsa después de que termina el dibujo */}
        <div style={{
          content: "''",
          position: "absolute",
          inset: -8,
          borderRadius: 52,
          border: "1.5px solid rgba(99,181,40,0)",
          animation: "glow-ring 0.8s ease 2.1s forwards",
          pointerEvents: "none",
        }} />

        <svg
          width="180" height="180"
          viewBox="0 0 180 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fondo del ícono */}
          <rect width="180" height="180" rx="40" fill="#1A2B1A" />
          <rect x="5" y="5" width="170" height="170" rx="35"
            fill="none" stroke="#2D5A2D" strokeWidth="1" />

          {/* Espina (verde oscuro) */}
          <line
            x1="44" y1="38" x2="44" y2="142"
            stroke="#3B6D11" strokeWidth="8" strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: "draw 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s forwards",
            }}
          />

          {/* Arco de la R (verde principal) */}
          <path
            d="M44 38 Q44 84 66 84 L88 84 Q114 84 114 102 Q114 120 88 120 L44 120"
            stroke="#63B528" strokeWidth="16"
            strokeLinecap="round" strokeLinejoin="round"
            fill="none"
            style={{
              strokeDasharray: 500,
              strokeDashoffset: 500,
              animation: "draw 0.9s cubic-bezier(0.4,0,0.2,1) 0.5s forwards",
            }}
          />

          {/* Círculo del bowl */}
          <circle
            cx="88" cy="102" r="18"
            stroke="#63B528" strokeWidth="16"
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 88 102)"
            style={{
              strokeDasharray: 240,
              strokeDashoffset: 240,
              animation: "draw 0.7s cubic-bezier(0.4,0,0.2,1) 1.1s forwards",
            }}
          />

          {/* Diagonal ámbar */}
          <line
            x1="101" y1="114" x2="134" y2="152"
            stroke="#EF9F27" strokeWidth="16" strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 120,
              strokeDashoffset: 120,
              animation: "draw 0.5s cubic-bezier(0.4,0,0.2,1) 1.6s forwards",
            }}
          />

          {/* Punto verde */}
          <circle cx="44" cy="84" r="5" fill="#63B528"
            style={{
              opacity: 0,
              animation: "pop-in 0.3s ease 1.4s forwards",
            }}
          />

          {/* Punto morado Premium */}
          <circle cx="44" cy="102" r="3.5" fill="#7F77DD"
            style={{
              opacity: 0,
              animation: "pop-in 0.3s ease 1.5s forwards",
            }}
          />
        </svg>
      </div>

      {/* ── Wordmark ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: 0,
        transform: "translateY(8px)",
        animation: "fade-up 0.6s ease 2.0s forwards",
        textAlign: "center",
      }}>
        <span style={{
          fontFamily: "Georgia, serif",
          fontSize: 52, fontWeight: 700,
          letterSpacing: 16,
          color: "#F0F0EC",
          display: "block",
        }}>
          RUPE
        </span>

        {/* Barra verde */}
        <div style={{
          height: 2,
          background: "#63B528",
          margin: "6px auto",
          borderRadius: 1,
          width: 0,
          animation: "expand-line 0.5s ease 2.4s forwards",
        }} />

        <span style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 11, letterSpacing: 4,
          color: "#63B528",
          display: "block",
          textTransform: "uppercase",
        }}>
          Registro · Progreso · Identidad
        </span>
      </div>

      {/* ── Tagline ── */}
      <p style={{
        fontFamily: "Arial, sans-serif",
        fontSize: 14,
        color: "rgba(240,240,236,0.4)",
        letterSpacing: "0.06em",
        margin: 0,
        opacity: 0,
        animation: "fade-in 0.6s ease 2.5s forwards",
      }}>
        Tu progreso, tu identidad.
      </p>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pop-in {
          0%   { opacity: 0; transform: scale(0); }
          70%  { transform: scale(1.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-up {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          to { opacity: 1; }
        }
        @keyframes expand-line {
          to { width: 200px; }
        }
        @keyframes glow-ring {
          0%   { border-color: rgba(99,181,40,0);   inset: -4px; }
          50%  { border-color: rgba(99,181,40,0.5); inset: -12px; }
          100% { border-color: rgba(99,181,40,0);   inset: -4px; }
        }
      `}</style>
    </div>
  );
}
