"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Zap, Users, User, Plus, Flame, Trophy, TrendingUp } from "lucide-react";
import RupeLogo from "@/components/RupeLogo";

interface Props {
  fullName: string;
  username: string;
  xp: number;
  level: number;
  streakDays: number;
}

const NIVELES = [
  { nombre: "Semilla",    xpMin: 0 },
  { nombre: "Brote",      xpMin: 500 },
  { nombre: "Raíz",       xpMin: 1200 },
  { nombre: "Tallo",      xpMin: 2500 },
  { nombre: "Hoja",       xpMin: 4500 },
  { nombre: "Rama",       xpMin: 7500 },
  { nombre: "Copa",       xpMin: 12000 },
  { nombre: "Árbol",      xpMin: 18000 },
  { nombre: "Bosque",     xpMin: 27000 },
  { nombre: "Ecosistema", xpMin: 40000 },
];

function getNivelInfo(xp: number) {
  let nivelActual = NIVELES[0];
  let nivelSig = NIVELES[1];
  for (let i = 0; i < NIVELES.length; i++) {
    if (xp >= NIVELES[i].xpMin) {
      nivelActual = NIVELES[i];
      nivelSig = NIVELES[i + 1] ?? null;
    }
  }
  const progreso = nivelSig
    ? ((xp - nivelActual.xpMin) / (nivelSig.xpMin - nivelActual.xpMin)) * 100
    : 100;
  const xpParaSiguiente = nivelSig ? nivelSig.xpMin - xp : 0;
  return { nivelActual, nivelSig, progreso, xpParaSiguiente };
}

// Anillo circular de progreso SVG
function XPRing({ progreso, xp }: { progreso: number; xp: number }) {
  const r = 54;
  const circunferencia = 2 * Math.PI * r;
  const [animado, setAnimado] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(progreso), 600);
    return () => clearTimeout(t);
  }, [progreso]);

  const offset = circunferencia - (animado / 100) * circunferencia;

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Pista */}
        <circle cx="70" cy="70" r={r}
          fill="none" stroke="rgba(99,181,40,0.12)" strokeWidth="10" />
        {/* Progreso */}
        <circle cx="70" cy="70" r={r}
          fill="none" stroke="#63B528" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      {/* Texto central */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 2,
      }}>
        <Zap size={16} color="#EF9F27" />
        <span style={{ fontSize: 22, fontWeight: 700, color: "#63B528", lineHeight: 1 }}>
          {xp.toLocaleString()}
        </span>
        <span style={{ fontSize: 10, color: "rgba(240,240,236,0.4)", letterSpacing: 1 }}>
          XP
        </span>
      </div>
    </div>
  );
}

export default function DashboardClient({ fullName, username, xp, level, streakDays }: Props) {
  const [visible, setVisible] = useState(false);
  const [navActivo, setNavActivo] = useState("home");
  const router = useRouter();
  const { nivelActual, nivelSig, progreso, xpParaSiguiente } = getNivelInfo(xp);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${ms}ms, transform 0.5s ease ${ms}ms`,
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 80 }}>

      {/* ── Top Bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        ...delay(0),
      }}>
        <RupeLogo size={36} />
        <span style={{
          fontFamily: "Georgia, serif",
          fontSize: 22, fontWeight: 700, letterSpacing: 6,
          color: "#F0F0EC",
        }}>
          RUPE
        </span>
        {/* Avatar placeholder */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          backgroundColor: "#1A2B1A",
          border: "2px solid #63B528",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <User size={16} color="#63B528" />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ── Saludo ── */}
        <div style={{ marginTop: 24, ...delay(100) }}>
          <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 13, margin: 0 }}>
            Bienvenido de vuelta 👋
          </p>
          <h2 style={{
            color: "#F0F0EC", fontSize: 26, fontWeight: 700,
            margin: "2px 0 0", lineHeight: 1.2,
          }}>
            {fullName}
          </h2>
          <p style={{ color: "#63B528", fontSize: 13, margin: "2px 0 0" }}>
            @{username}
          </p>
        </div>

        {/* ── XP Ring + Nivel ── */}
        <div style={{
          marginTop: 24,
          backgroundColor: "#0F1A0F",
          borderRadius: 20,
          border: "1px solid rgba(45,90,45,0.4)",
          padding: "20px",
          display: "flex", alignItems: "center", gap: 20,
          ...delay(150),
        }}>
          <XPRing progreso={progreso} xp={xp} />

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Trophy size={14} color="#EF9F27" />
              <span style={{ color: "#EF9F27", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                Nivel {level}
              </span>
            </div>
            <p style={{ color: "#F0F0EC", fontSize: 22, fontWeight: 700, margin: 0 }}>
              {nivelActual.nombre}
            </p>

            {nivelSig && (
              <>
                {/* Barra de progreso */}
                <div style={{
                  marginTop: 10,
                  height: 5, borderRadius: 3,
                  backgroundColor: "rgba(99,181,40,0.12)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    backgroundColor: "#63B528",
                    width: `${progreso}%`,
                    transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.6s",
                  }} />
                </div>
                <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, marginTop: 6 }}>
                  {xpParaSiguiente.toLocaleString()} XP para {nivelSig.nombre}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginTop: 12,
          ...delay(200),
        }}>
          {/* Racha */}
          <div style={{
            backgroundColor: "#0F1A0F",
            borderRadius: 16,
            border: "1px solid rgba(239,159,39,0.2)",
            padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Flame size={16} color="#EF9F27" />
              <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                Racha
              </span>
            </div>
            <p style={{ color: "#EF9F27", fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>
              {streakDays}
            </p>
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, marginTop: 4 }}>
              días consecutivos
            </p>
          </div>

          {/* Actividades */}
          <div style={{
            backgroundColor: "#0F1A0F",
            borderRadius: 16,
            border: "1px solid rgba(45,90,45,0.3)",
            padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <TrendingUp size={16} color="#63B528" />
              <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                Hoy
              </span>
            </div>
            <p style={{ color: "#63B528", fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1 }}>
              0
            </p>
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, marginTop: 4 }}>
              actividades
            </p>
          </div>
        </div>

        {/* ── Acción principal ── */}
        <button style={{
          marginTop: 12,
          width: "100%",
          backgroundColor: "#63B528",
          border: "none",
          borderRadius: 14,
          padding: "16px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          cursor: "pointer",
          color: "#fff",
          fontSize: 16, fontWeight: 600,
          ...delay(250),
          transition: `background 0.2s ease, opacity 0.5s ease 250ms, transform 0.5s ease 250ms`,
        }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#3B6D11")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#63B528")}
          onClick={() => router.push("/tracker")}
        >
          <Plus size={20} />
          Registrar actividad de hoy
        </button>

        {/* ── Feed / Actividad reciente ── */}
        <div style={{ marginTop: 24, ...delay(300) }}>
          <p style={{
            color: "rgba(240,240,236,0.5)", fontSize: 12,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 12,
          }}>
            Actividad reciente
          </p>

          {/* Empty state */}
          <div style={{
            backgroundColor: "#0F1A0F",
            borderRadius: 16,
            border: "1px solid rgba(45,90,45,0.2)",
            padding: "32px 20px",
            textAlign: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              backgroundColor: "rgba(99,181,40,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <Zap size={22} color="rgba(99,181,40,0.4)" />
            </div>
            <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 14, margin: 0 }}>
              Aún no hay actividades
            </p>
            <p style={{ color: "rgba(240,240,236,0.25)", fontSize: 12, marginTop: 4 }}>
              Registra tu primera actividad y empieza a acumular XP
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#0D1117",
        borderTop: "1px solid rgba(45,90,45,0.3)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 16px",
        ...delay(400),
      }}>
        {[
          { id: "home",        icon: <Home size={22} />,  label: "Inicio",     ruta: "/dashboard" },
          { id: "tracker",     icon: <Zap size={22} />,   label: "Tracker",    ruta: "/tracker" },
          { id: "comunidades", icon: <Users size={22} />, label: "Comunidad",  ruta: "/comunidades" },
          { id: "perfil",      icon: <User size={22} />,  label: "Perfil",     ruta: "/perfil" },
        ].map(({ id, icon, label, ruta }) => (
          <button key={id}
            onClick={() => { setNavActivo(id); router.push(ruta); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: navActivo === id ? "#63B528" : "rgba(240,240,236,0.3)",
              transition: "color 0.2s ease",
              fontSize: 10, letterSpacing: 0.5,
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
