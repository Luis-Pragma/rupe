"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Zap, Users, User, Lock } from "lucide-react";

const TODAS_INSIGNIAS = [
  // Contenido
  { type: "contenido_1",  title: "Primer Paso Digital",   emoji: "🎬", categoria: "Contenido", umbral: 1,  umbralTipo: "content",  xpReward: 25,  desc: "Primera actividad de contenido" },
  { type: "contenido_7",  title: "Creador Constante",     emoji: "📱", categoria: "Contenido", umbral: 7,  umbralTipo: "content",  xpReward: 50,  desc: "7 actividades de contenido" },
  { type: "contenido_14", title: "Creador Semanal",       emoji: "🎥", categoria: "Contenido", umbral: 14, umbralTipo: "content",  xpReward: 100, desc: "14 actividades de contenido" },
  { type: "contenido_30", title: "Creador Mensual",       emoji: "⭐", categoria: "Contenido", umbral: 30, umbralTipo: "content",  xpReward: 200, desc: "30 actividades de contenido" },
  { type: "contenido_50", title: "Maestro del Contenido", emoji: "👑", categoria: "Contenido", umbral: 50, umbralTipo: "content",  xpReward: 500, desc: "50 actividades de contenido" },
  // Finanzas
  { type: "finanzas_1",   title: "Primer Peso Consciente", emoji: "💸", categoria: "Finanzas", umbral: 1,  umbralTipo: "finance",  xpReward: 25,  desc: "Primera actividad financiera" },
  { type: "finanzas_7",   title: "Ahorrador",             emoji: "💰", categoria: "Finanzas", umbral: 7,  umbralTipo: "finance",  xpReward: 50,  desc: "7 actividades financieras" },
  { type: "finanzas_14",  title: "Inversor",              emoji: "📈", categoria: "Finanzas", umbral: 14, umbralTipo: "finance",  xpReward: 100, desc: "14 actividades financieras" },
  { type: "finanzas_30",  title: "Planeador Financiero",  emoji: "🏦", categoria: "Finanzas", umbral: 30, umbralTipo: "finance",  xpReward: 200, desc: "30 actividades financieras" },
  { type: "finanzas_50",  title: "Maestro Financiero",    emoji: "💎", categoria: "Finanzas", umbral: 50, umbralTipo: "finance",  xpReward: 500, desc: "50 actividades financieras" },
  // Aprendizaje
  { type: "aprendizaje_1",  title: "Curiosidad Activada",  emoji: "🔍", categoria: "Aprendizaje", umbral: 1,  umbralTipo: "learning", xpReward: 25,  desc: "Primera actividad de aprendizaje" },
  { type: "aprendizaje_7",  title: "Estudioso",            emoji: "📚", categoria: "Aprendizaje", umbral: 7,  umbralTipo: "learning", xpReward: 50,  desc: "7 actividades de aprendizaje" },
  { type: "aprendizaje_14", title: "Aprendiz Dedicado",    emoji: "🎓", categoria: "Aprendizaje", umbral: 14, umbralTipo: "learning", xpReward: 100, desc: "14 actividades de aprendizaje" },
  { type: "aprendizaje_30", title: "Maestro del Saber",    emoji: "🧠", categoria: "Aprendizaje", umbral: 30, umbralTipo: "learning", xpReward: 200, desc: "30 actividades de aprendizaje" },
  { type: "aprendizaje_50", title: "Sabio",                emoji: "✨", categoria: "Aprendizaje", umbral: 50, umbralTipo: "learning", xpReward: 500, desc: "50 actividades de aprendizaje" },
  // Social
  { type: "social_1",  title: "Primera Conexión", emoji: "🤝", categoria: "Social", umbral: 1,  umbralTipo: "social",   xpReward: 25,  desc: "Primera actividad social" },
  { type: "social_7",  title: "Networker",        emoji: "🌐", categoria: "Social", umbral: 7,  umbralTipo: "social",   xpReward: 50,  desc: "7 actividades sociales" },
  { type: "social_14", title: "Conector",         emoji: "🔗", categoria: "Social", umbral: 14, umbralTipo: "social",   xpReward: 100, desc: "14 actividades sociales" },
  { type: "social_30", title: "Líder Social",     emoji: "🏆", categoria: "Social", umbral: 30, umbralTipo: "social",   xpReward: 200, desc: "30 actividades sociales" },
  { type: "social_50", title: "Maestro Social",   emoji: "🌟", categoria: "Social", umbral: 50, umbralTipo: "social",   xpReward: 500, desc: "50 actividades sociales" },
  // Salud
  { type: "salud_1",  title: "Primer Hábito",        emoji: "🌱", categoria: "Salud", umbral: 1,  umbralTipo: "health",   xpReward: 25,  desc: "Primera actividad de salud" },
  { type: "salud_7",  title: "Activo",               emoji: "💪", categoria: "Salud", umbral: 7,  umbralTipo: "health",   xpReward: 50,  desc: "7 actividades de salud" },
  { type: "salud_14", title: "Saludable",            emoji: "🏃", categoria: "Salud", umbral: 14, umbralTipo: "health",   xpReward: 100, desc: "14 actividades de salud" },
  { type: "salud_30", title: "Atleta Mental",        emoji: "🔥", categoria: "Salud", umbral: 30, umbralTipo: "health",   xpReward: 200, desc: "30 actividades de salud" },
  { type: "salud_50", title: "Maestro del Bienestar",emoji: "⚡", categoria: "Salud", umbral: 50, umbralTipo: "health",   xpReward: 500, desc: "50 actividades de salud" },
  // Rachas
  { type: "racha_7",  title: "Semana Perfecta", emoji: "🔥", categoria: "Racha", umbral: 7,  umbralTipo: "streak",   xpReward: 100, desc: "7 días consecutivos" },
  { type: "racha_14", title: "Dos Semanas",     emoji: "💫", categoria: "Racha", umbral: 14, umbralTipo: "streak",   xpReward: 200, desc: "14 días consecutivos" },
  { type: "racha_30", title: "Mes de Fuego",    emoji: "🌋", categoria: "Racha", umbral: 30, umbralTipo: "streak",   xpReward: 500, desc: "30 días consecutivos" },
  // Niveles
  { type: "nivel_5",  title: "A Medio Camino", emoji: "🎯", categoria: "Nivel", umbral: 5,  umbralTipo: "level",    xpReward: 200,  desc: "Alcanza el nivel 5" },
  { type: "nivel_10", title: "Ecosistema",     emoji: "🌍", categoria: "Nivel", umbral: 10, umbralTipo: "level",    xpReward: 1000, desc: "Alcanza el nivel 10" },
];

const CATEGORIAS_COLORES: Record<string, { color: string; bg: string }> = {
  Contenido:   { color: "#63B528", bg: "rgba(99,181,40,0.15)" },
  Finanzas:    { color: "#EF9F27", bg: "rgba(239,159,39,0.15)" },
  Aprendizaje: { color: "#7F77DD", bg: "rgba(127,119,221,0.15)" },
  Social:      { color: "#38BDF8", bg: "rgba(56,189,248,0.15)" },
  Salud:       { color: "#F87171", bg: "rgba(248,113,113,0.15)" },
  Racha:       { color: "#EF9F27", bg: "rgba(239,159,39,0.15)" },
  Nivel:       { color: "#FFD700", bg: "rgba(255,215,0,0.12)" },
};

interface Achievement { type: string; title: string; unlocked_at: string }
interface Props {
  achievements: Achievement[];
  userData: { level: number; xp: number; streak_days: number };
  conteoCategoria: Record<string, number>;
}

function progresoHacia(insignia: typeof TODAS_INSIGNIAS[0], conteo: Record<string, number>, nivel: number, racha: number): number {
  if (insignia.umbralTipo === "level") return Math.min(100, (nivel / insignia.umbral) * 100);
  if (insignia.umbralTipo === "streak") return Math.min(100, (racha / insignia.umbral) * 100);
  return Math.min(100, ((conteo[insignia.umbralTipo] ?? 0) / insignia.umbral) * 100);
}

function valorActual(insignia: typeof TODAS_INSIGNIAS[0], conteo: Record<string, number>, nivel: number, racha: number): number {
  if (insignia.umbralTipo === "level") return nivel;
  if (insignia.umbralTipo === "streak") return racha;
  return conteo[insignia.umbralTipo] ?? 0;
}

export default function InsigniasClient({ achievements, userData, conteoCategoria }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [filtro, setFiltro] = useState("Todas");
  const [seleccionada, setSeleccionada] = useState<typeof TODAS_INSIGNIAS[0] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const tiposDesbloqueados = new Set(achievements.map(a => a.type));
  const desbloqueadas = TODAS_INSIGNIAS.filter(i => tiposDesbloqueados.has(i.type));
  const bloqueadas = TODAS_INSIGNIAS.filter(i => !tiposDesbloqueados.has(i.type));

  const categorias = ["Todas", "Contenido", "Finanzas", "Aprendizaje", "Social", "Salud", "Racha", "Nivel"];

  const insigniasFiltradas = TODAS_INSIGNIAS.filter(i =>
    filtro === "Todas" || i.categoria === filtro
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => router.push("/perfil")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,240,236,0.5)", padding: 0 }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ color: "#F0F0EC", fontSize: 22, fontWeight: 700, margin: 0 }}>
              Mis Insignias
            </h1>
            <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 13, margin: "2px 0 0" }}>
              {desbloqueadas.length} de {TODAS_INSIGNIAS.length} desbloqueadas
            </p>
          </div>
        </div>

        {/* Progreso general */}
        <div style={{
          backgroundColor: "#0F1A0F",
          borderRadius: 12, padding: "10px 14px",
          border: "1px solid rgba(45,90,45,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(240,240,236,0.5)", fontSize: 12 }}>Progreso total</span>
            <span style={{ color: "#63B528", fontSize: 12, fontWeight: 600 }}>
              {Math.round((desbloqueadas.length / TODAS_INSIGNIAS.length) * 100)}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(99,181,40,0.12)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, backgroundColor: "#63B528",
              width: `${(desbloqueadas.length / TODAS_INSIGNIAS.length) * 100}%`,
              transition: "width 1s ease 0.3s",
            }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 16px 0" }}>

        {/* ── Filtros ── */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 4, marginBottom: 16,
          opacity: visible ? 1 : 0, transition: "opacity 0.4s ease 0.1s",
        }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                border: "1px solid",
                borderColor: filtro === cat ? "#63B528" : "rgba(45,90,45,0.3)",
                backgroundColor: filtro === cat ? "rgba(99,181,40,0.15)" : "transparent",
                color: filtro === cat ? "#63B528" : "rgba(240,240,236,0.5)",
                fontSize: 12, fontWeight: filtro === cat ? 600 : 400,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Grid de insignias ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        }}>
          {insigniasFiltradas.map((insignia, i) => {
            const desbloqueada = tiposDesbloqueados.has(insignia.type);
            const cat = CATEGORIAS_COLORES[insignia.categoria] ?? { color: "#63B528", bg: "rgba(99,181,40,0.15)" };
            const progreso = progresoHacia(insignia, conteoCategoria, userData.level, userData.streak_days);
            const actual = valorActual(insignia, conteoCategoria, userData.level, userData.streak_days);

            return (
              <button
                key={insignia.type}
                onClick={() => setSeleccionada(insignia)}
                style={{
                  backgroundColor: desbloqueada ? cat.bg : "rgba(15,26,15,0.8)",
                  borderRadius: 14,
                  border: `1px solid ${desbloqueada ? cat.color : "rgba(45,90,45,0.2)"}`,
                  padding: "14px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "scale(1)" : "scale(0.9)",
                  transition: `opacity 0.4s ease ${0.1 + i * 0.03}s, transform 0.4s ease ${0.1 + i * 0.03}s`,
                  position: "relative",
                }}
              >
                {/* Emoji con filtro si bloqueada */}
                <div style={{
                  fontSize: 28,
                  filter: desbloqueada ? "none" : "grayscale(1) opacity(0.3)",
                  marginBottom: 6,
                }}>
                  {insignia.emoji}
                </div>

                {/* Nombre */}
                <p style={{
                  color: desbloqueada ? "#F0F0EC" : "rgba(240,240,236,0.3)",
                  fontSize: 10, fontWeight: 600, margin: 0, lineHeight: 1.3,
                }}>
                  {insignia.title}
                </p>

                {/* XP */}
                <p style={{
                  color: desbloqueada ? cat.color : "rgba(240,240,236,0.2)",
                  fontSize: 10, margin: "4px 0 0", fontWeight: 600,
                }}>
                  +{insignia.xpReward} XP
                </p>

                {/* Progreso si no desbloqueada */}
                {!desbloqueada && progreso > 0 && (
                  <div style={{
                    marginTop: 8, height: 2, borderRadius: 1,
                    backgroundColor: "rgba(45,90,45,0.2)", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", backgroundColor: cat.color,
                      width: `${progreso}%`,
                    }} />
                  </div>
                )}

                {/* Lock icon */}
                {!desbloqueada && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                  }}>
                    <Lock size={10} color="rgba(240,240,236,0.2)" />
                  </div>
                )}

                {/* Check si desbloqueada */}
                {desbloqueada && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 16, height: 16, borderRadius: "50%",
                    backgroundColor: cat.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 9, color: "#0D1117" }}>✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Modal de detalle ── */}
      {seleccionada && (() => {
        const desbloqueada = tiposDesbloqueados.has(seleccionada.type);
        const cat = CATEGORIAS_COLORES[seleccionada.categoria] ?? { color: "#63B528", bg: "rgba(99,181,40,0.15)" };
        const progreso = progresoHacia(seleccionada, conteoCategoria, userData.level, userData.streak_days);
        const actual = valorActual(seleccionada, conteoCategoria, userData.level, userData.streak_days);

        return (
          <div
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setSeleccionada(null)}
          >
            <div
              style={{
                backgroundColor: "#0F1A0F",
                borderRadius: 24,
                border: `1px solid ${cat.color}`,
                padding: "32px 24px",
                maxWidth: 300, width: "100%",
                textAlign: "center",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 56, marginBottom: 16, filter: desbloqueada ? "none" : "grayscale(1) opacity(0.4)" }}>
                {seleccionada.emoji}
              </div>
              <h2 style={{ color: "#F0F0EC", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
                {seleccionada.title}
              </h2>
              <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 13, margin: "0 0 16px" }}>
                {seleccionada.desc}
              </p>

              {desbloqueada ? (
                <div style={{
                  backgroundColor: cat.bg, borderRadius: 12, padding: "10px",
                  color: cat.color, fontSize: 13, fontWeight: 600,
                }}>
                  ✓ Desbloqueada · +{seleccionada.xpReward} XP
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 12 }}>Progreso</span>
                      <span style={{ color: cat.color, fontSize: 12, fontWeight: 600 }}>
                        {actual}/{seleccionada.umbral}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(45,90,45,0.2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, backgroundColor: cat.color, width: `${progreso}%` }} />
                    </div>
                  </div>
                  <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 12, margin: 0 }}>
                    Recompensa: <span style={{ color: cat.color, fontWeight: 600 }}>+{seleccionada.xpReward} XP</span>
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#0D1117",
        borderTop: "1px solid rgba(45,90,45,0.3)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 16px",
      }}>
        {[
          { icon: <Home size={22} />, label: "Inicio", ruta: "/dashboard" },
          { icon: <Zap size={22} />, label: "Tracker", ruta: "/tracker" },
          { icon: <Users size={22} />, label: "Comunidad", ruta: "/comunidades" },
          { icon: <User size={22} />, label: "Perfil", ruta: "/perfil", activo: true },
        ].map(({ icon, label, ruta, activo }) => (
          <button key={ruta}
            onClick={() => router.push(ruta)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: activo ? "#63B528" : "rgba(240,240,236,0.3)",
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
