"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Share2, Home, Zap, Users, User,
  Flame, Trophy, CheckCircle, Copy
} from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Actividad {
  id: string;
  title: string;
  category: string;
  xp_earned: number;
  created_at: string;
}

interface Props {
  fullName: string;
  username: string;
  tagline: string | null;
  xp: number;
  level: number;
  streakDays: number;
  actividades: Actividad[];
  totalActividades: number;
  esPublico?: boolean;
}

// ── Constantes ────────────────────────────────────────────────────────────────
const NIVELES = [
  { nombre: "Semilla", xpMin: 0 }, { nombre: "Brote", xpMin: 500 },
  { nombre: "Raíz", xpMin: 1200 }, { nombre: "Tallo", xpMin: 2500 },
  { nombre: "Hoja", xpMin: 4500 }, { nombre: "Rama", xpMin: 7500 },
  { nombre: "Copa", xpMin: 12000 }, { nombre: "Árbol", xpMin: 18000 },
  { nombre: "Bosque", xpMin: 27000 }, { nombre: "Ecosistema", xpMin: 40000 },
];

const CATEGORIAS = [
  { id: "content",  label: "Contenido",   emoji: "📹", color: "#63B528", glow: "rgba(99,181,40,0.3)" },
  { id: "finance",  label: "Finanzas",    emoji: "💰", color: "#EF9F27", glow: "rgba(239,159,39,0.3)" },
  { id: "learning", label: "Aprendizaje", emoji: "📚", color: "#7F77DD", glow: "rgba(127,119,221,0.3)" },
  { id: "social",   label: "Social",      emoji: "🤝", color: "#63B528", glow: "rgba(99,181,40,0.3)" },
  { id: "health",   label: "Salud",       emoji: "💪", color: "#EF9F27", glow: "rgba(239,159,39,0.3)" },
];

function getNivelInfo(xp: number) {
  let actual = NIVELES[0], siguiente = NIVELES[1];
  for (let i = 0; i < NIVELES.length; i++) {
    if (xp >= NIVELES[i].xpMin) { actual = NIVELES[i]; siguiente = NIVELES[i + 1] ?? null!; }
  }
  const progreso = siguiente
    ? ((xp - actual.xpMin) / (siguiente.xpMin - actual.xpMin)) * 100 : 100;
  return { actual, siguiente, progreso };
}

// ── Contador animado ──────────────────────────────────────────────────────────
function ContadorAnimado({ valor, duracion = 1200 }: { valor: number; duracion?: number }) {
  const [mostrado, setMostrado] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = duracion / 60;
    const increment = valor / 60;
    const timer = setInterval(() => {
      start += increment;
      if (start >= valor) { setMostrado(valor); clearInterval(timer); }
      else setMostrado(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [valor, duracion]);
  return <>{mostrado.toLocaleString()}</>;
}

// ── Anillo SVG ────────────────────────────────────────────────────────────────
function AnilloXP({ progreso, size = 110, strokeWidth = 8, color = "#63B528" }:
  { progreso: number; size?: number; strokeWidth?: number; color?: string }) {
  const [anim, setAnim] = useState(0);
  const r = (size - strokeWidth * 2) / 2;
  const circunf = 2 * Math.PI * r;
  useEffect(() => { const t = setTimeout(() => setAnim(progreso), 300); return () => clearTimeout(t); }, [progreso]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circunf}
        strokeDashoffset={circunf - (anim / 100) * circunf}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }}
        filter={`drop-shadow(0 0 6px ${color})`}
      />
    </svg>
  );
}

// ── Heatmap de actividad ──────────────────────────────────────────────────────
function Heatmap({ actividades }: { actividades: Actividad[] }) {
  const semanas = 15;
  const dias = semanas * 7;
  const hoy = new Date();

  const mapaXP: Record<string, number> = {};
  actividades.forEach(a => {
    const fecha = a.created_at.split("T")[0];
    mapaXP[fecha] = (mapaXP[fecha] ?? 0) + a.xp_earned;
  });

  const celdas = Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (dias - 1 - i));
    const key = d.toISOString().split("T")[0];
    const xp = mapaXP[key] ?? 0;
    let color = "rgba(255,255,255,0.05)";
    if (xp > 0 && xp < 50)   color = "rgba(99,181,40,0.25)";
    if (xp >= 50 && xp < 150) color = "rgba(99,181,40,0.5)";
    if (xp >= 150)             color = "#63B528";
    return { key, color, xp };
  });

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "grid", gridTemplateRows: "repeat(7, 10px)", gridAutoFlow: "column", gap: 3, width: "fit-content" }}>
        {celdas.map((c, i) => (
          <div key={i} title={`${c.key}: ${c.xp} XP`} style={{
            width: 10, height: 10, borderRadius: 2,
            backgroundColor: c.color,
            transition: `background-color 0.3s ease ${i * 5}ms`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function PerfilClient({
  fullName, username, tagline, xp, level,
  streakDays, actividades, totalActividades, esPublico = false,
}: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const { actual, siguiente, progreso } = getNivelInfo(xp);

  // XP por categoría
  const xpPorCat: Record<string, number> = {};
  actividades.forEach(a => {
    xpPorCat[a.category] = (xpPorCat[a.category] ?? 0) + a.xp_earned;
  });
  const maxCatXP = Math.max(...Object.values(xpPorCat), 1);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  function compartir() {
    const url = `${window.location.origin}/@${username}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  const delay = (ms: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.6s ease ${ms}ms, transform 0.6s ease ${ms}ms`,
  });

  const levelColor =
    level <= 3 ? "#63B528" :
    level <= 6 ? "#EF9F27" :
    level <= 8 ? "#7F77DD" : "#FFD700";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90, overflowX: "hidden" }}>

      {/* ── Hero background ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 220,
        background: `radial-gradient(ellipse at 50% 0%, rgba(99,181,40,0.18) 0%, transparent 70%),
                     linear-gradient(180deg, #0F1A0F 0%, #0D1117 100%)`,
        pointerEvents: "none",
      }} />

      {/* Partículas decorativas */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 2, height: 2, borderRadius: "50%",
          backgroundColor: "#63B528",
          opacity: 0.3,
          top: `${10 + i * 12}%`,
          left: `${10 + i * 15}%`,
          animation: `float ${3 + i}s ease-in-out ${i * 0.5}s infinite alternate`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Top bar ── */}
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
        ...delay(0),
      }}>
        {esPublico ? (
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "6px 12px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>🌱</span>
            <span style={{ color: "#63B528", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>RUPE</span>
          </div>
        ) : (
          <button onClick={() => router.push("/dashboard")} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "8px 10px", cursor: "pointer", color: "rgba(240,240,236,0.6)",
            display: "flex", alignItems: "center",
          }}>
            <ArrowLeft size={18} />
          </button>
        )}

        <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 13 }}>
          {esPublico ? `@${username}` : "Mi perfil"}
        </span>

        <button onClick={compartir} style={{
          background: copiado ? "rgba(99,181,40,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${copiado ? "rgba(99,181,40,0.4)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 10, padding: "8px 12px", cursor: "pointer",
          color: copiado ? "#63B528" : "rgba(240,240,236,0.6)",
          display: "flex", alignItems: "center", gap: 6, fontSize: 13,
          transition: "all 0.3s ease",
        }}>
          {copiado ? <CheckCircle size={15} /> : <Share2 size={15} />}
          {copiado ? "¡Copiado!" : "Compartir"}
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px", position: "relative" }}>

        {/* ── Avatar + Anillo ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 8, ...delay(100) }}>
          <div style={{ position: "relative", width: 110, height: 110 }}>
            {/* Anillo XP */}
            <div style={{ position: "absolute", inset: 0 }}>
              <AnilloXP progreso={progreso} size={110} strokeWidth={5} color={levelColor} />
            </div>
            {/* Avatar */}
            <div style={{
              position: "absolute", inset: 8,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #1A2B1A, #0F1A0F)`,
              border: `2px solid ${levelColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px ${levelColor}40, 0 0 40px ${levelColor}20`,
              fontSize: 36,
            }}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            {/* Badge de nivel */}
            <div style={{
              position: "absolute", bottom: -4, right: -4,
              backgroundColor: levelColor,
              borderRadius: 20, padding: "2px 8px",
              fontSize: 11, fontWeight: 700, color: "#0D1117",
              border: "2px solid #0D1117",
              boxShadow: `0 0 10px ${levelColor}60`,
            }}>
              Nv.{level}
            </div>
          </div>

          {/* Nombre y username */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <h1 style={{ color: "#F0F0EC", fontSize: 24, fontWeight: 700, margin: 0 }}>
              {fullName}
            </h1>
            <p style={{ color: "#63B528", fontSize: 14, margin: "2px 0 0" }}>@{username}</p>
            {tagline && (
              <p style={{ color: "rgba(240,240,236,0.45)", fontSize: 13, margin: "6px 0 0", fontStyle: "italic" }}>
                "{tagline}"
              </p>
            )}
          </div>

          {/* Nivel actual */}
          <div style={{
            marginTop: 12,
            background: `linear-gradient(135deg, ${levelColor}15, ${levelColor}08)`,
            border: `1px solid ${levelColor}30`,
            borderRadius: 20, padding: "6px 16px",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Trophy size={14} color={levelColor} />
            <span style={{ color: levelColor, fontSize: 13, fontWeight: 600 }}>
              {actual.nombre}
            </span>
            {siguiente && (
              <span style={{ color: "rgba(240,240,236,0.3)", fontSize: 12 }}>
                → {siguiente.nombre}
              </span>
            )}
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10, marginTop: 20, ...delay(180),
        }}>
          {[
            { label: "XP Total", valor: xp, color: "#63B528", icon: "⚡" },
            { label: "Racha", valor: streakDays, color: "#EF9F27", icon: "🔥", suffix: "d" },
            { label: "Actividades", valor: totalActividades, color: "#7F77DD", icon: "📊" },
          ].map(({ label, valor, color, icon, suffix }) => (
            <div key={label} style={{
              backgroundColor: "#0F1A0F",
              border: `1px solid ${color}20`,
              borderRadius: 14, padding: "14px 10px",
              textAlign: "center",
              boxShadow: `0 4px 20px ${color}10`,
            }}>
              <p style={{ fontSize: 20, margin: "0 0 4px" }}>{icon}</p>
              <p style={{ color, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: 1 }}>
                <ContadorAnimado valor={valor} />
                {suffix}
              </p>
              <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "4px 0 0" }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Barra de nivel ── */}
        {siguiente && (
          <div style={{ marginTop: 14, ...delay(220) }}>
            <div style={{
              backgroundColor: "#0F1A0F",
              border: "1px solid rgba(45,90,45,0.2)",
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(240,240,236,0.5)", fontSize: 12 }}>
                  Progreso al nivel {level + 1}
                </span>
                <span style={{ color: levelColor, fontSize: 12, fontWeight: 600 }}>
                  {Math.round(progreso)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}99)`,
                  width: `${progreso}%`,
                  transition: "width 1.4s cubic-bezier(0.4,0,0.2,1) 0.3s",
                  boxShadow: `0 0 8px ${levelColor}60`,
                }} />
              </div>
              <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, margin: "6px 0 0", textAlign: "right" }}>
                {(siguiente.xpMin - xp).toLocaleString()} XP para {siguiente.nombre}
              </p>
            </div>
          </div>
        )}

        {/* ── Accesos rápidos ── */}
        {!esPublico && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, ...delay(240) }}>
            <button
              onClick={() => router.push("/insignias")}
              style={{
                backgroundColor: "#0F1A0F", border: "1px solid rgba(255,215,0,0.2)",
                borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              }}
            >
              <span style={{ fontSize: 22 }}>🏆</span>
              <div>
                <p style={{ color: "#F0F0EC", fontSize: 12, fontWeight: 600, margin: 0 }}>Insignias</p>
                <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 10, margin: "2px 0 0" }}>Ver logros</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/racha-compartida")}
              style={{
                backgroundColor: "#0F1A0F", border: "1px solid rgba(239,159,39,0.2)",
                borderRadius: 14, padding: "14px 12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              }}
            >
              <span style={{ fontSize: 22 }}>🔥</span>
              <div>
                <p style={{ color: "#F0F0EC", fontSize: 12, fontWeight: 600, margin: 0 }}>Racha Compartida</p>
                <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 10, margin: "2px 0 0" }}>Con un amigo</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Progreso por categoría ── */}
        <div style={{ marginTop: 16, ...delay(260) }}>
          <p style={{
            color: "rgba(240,240,236,0.4)", fontSize: 11,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 10,
          }}>
            Progreso por área
          </p>
          <div style={{
            backgroundColor: "#0F1A0F",
            border: "1px solid rgba(45,90,45,0.2)",
            borderRadius: 16, padding: "16px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            {CATEGORIAS.map(cat => {
              const catXP = xpPorCat[cat.id] ?? 0;
              const pct = maxCatXP > 0 ? Math.round((catXP / maxCatXP) * 100) : 0;
              return (
                <div key={cat.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                      <span style={{ color: "rgba(240,240,236,0.7)", fontSize: 13 }}>{cat.label}</span>
                    </div>
                    <span style={{ color: cat.color, fontSize: 12, fontWeight: 600 }}>
                      {catXP > 0 ? `${catXP} XP` : "Sin actividad"}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                      width: `${pct}%`,
                      transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s",
                      boxShadow: pct > 0 ? `0 0 6px ${cat.glow}` : "none",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Heatmap ── */}
        <div style={{ marginTop: 16, ...delay(300) }}>
          <p style={{
            color: "rgba(240,240,236,0.4)", fontSize: 11,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 10,
          }}>
            Actividad — últimas 15 semanas
          </p>
          <div style={{
            backgroundColor: "#0F1A0F",
            border: "1px solid rgba(45,90,45,0.2)",
            borderRadius: 16, padding: "16px",
          }}>
            <Heatmap actividades={actividades} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
              <span style={{ color: "rgba(240,240,236,0.25)", fontSize: 10 }}>Menos</span>
              {["rgba(255,255,255,0.05)", "rgba(99,181,40,0.25)", "rgba(99,181,40,0.5)", "#63B528"].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
              ))}
              <span style={{ color: "rgba(240,240,236,0.25)", fontSize: 10 }}>Más</span>
            </div>
          </div>
        </div>

        {/* ── Actividad reciente ── */}
        <div style={{ marginTop: 16, ...delay(340) }}>
          <p style={{
            color: "rgba(240,240,236,0.4)", fontSize: 11,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 10,
          }}>
            Actividad reciente
          </p>

          {actividades.length === 0 ? (
            <div style={{
              backgroundColor: "#0F1A0F", borderRadius: 14,
              border: "1px solid rgba(45,90,45,0.15)",
              padding: "24px", textAlign: "center",
            }}>
              <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 13, margin: 0 }}>
                Aún sin actividades registradas
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actividades.slice(0, 8).map((act, i) => {
                const cat = CATEGORIAS.find(c => c.id === act.category);
                return (
                  <div key={act.id} style={{
                    backgroundColor: "#0F1A0F",
                    border: "1px solid rgba(45,90,45,0.15)",
                    borderRadius: 12, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-16px)",
                    transition: `opacity 0.4s ease ${380 + i * 60}ms, transform 0.4s ease ${380 + i * 60}ms`,
                  }}>
                    <span style={{ fontSize: 20 }}>{cat?.emoji ?? "⚡"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: "#F0F0EC", fontSize: 13, fontWeight: 600,
                        margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {act.title}
                      </p>
                      <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "2px 0 0" }}>
                        {new Date(act.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: `${cat?.color ?? "#63B528"}15`,
                      color: cat?.color ?? "#63B528",
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 8, flexShrink: 0,
                    }}>
                      +{act.xp_earned} XP
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Nav (solo si no es público) ── */}
      {!esPublico && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: "#0D1117",
          borderTop: "1px solid rgba(45,90,45,0.3)",
          display: "flex", justifyContent: "space-around",
          padding: "10px 0 16px",
        }}>
          {[
            { id: "home",        icon: <Home size={22} />,  label: "Inicio",    ruta: "/dashboard" },
            { id: "tracker",     icon: <Zap size={22} />,   label: "Tracker",   ruta: "/tracker" },
            { id: "comunidades", icon: <Users size={22} />, label: "Comunidad", ruta: "/comunidades" },
            { id: "perfil",      icon: <User size={22} />,  label: "Perfil",    ruta: "/perfil" },
          ].map(({ id, icon, label, ruta }) => (
            <button key={id} onClick={() => router.push(ruta)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: id === "perfil" ? "#63B528" : "rgba(240,240,236,0.3)",
              fontSize: 10, letterSpacing: 0.5,
            }}>
              {icon}{label}
            </button>
          ))}
        </nav>
      )}

      {/* ── CTA público: unirse a RUPE ── */}
      {esPublico && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: "#0D1117",
          borderTop: "1px solid rgba(45,90,45,0.3)",
          padding: "12px 20px 20px",
        }}>
          <button onClick={() => router.push("/registro")} style={{
            width: "100%", backgroundColor: "#63B528", border: "none",
            borderRadius: 14, padding: "14px",
            color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Zap size={18} />
            Únete a RUPE y empieza tu progreso
          </button>
        </div>
      )}

      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
