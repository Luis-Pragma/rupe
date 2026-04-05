"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Zap, Users, User, Trophy } from "lucide-react";

// ── Colores por nivel ──
function colorNivel(level: number) {
  if (level <= 3) return "#63B528";
  if (level <= 6) return "#EF9F27";
  if (level <= 8) return "#7F77DD";
  return "#FFD700";
}

function nombreNivel(level: number) {
  const nombres = ["", "Semilla", "Brote", "Raíz", "Tallo", "Hoja", "Rama", "Copa", "Árbol", "Bosque", "Ecosistema"];
  return nombres[level] ?? "Semilla";
}

interface Jugador {
  id: string;
  username: string;
  full_name: string;
  level: number;
  xp: number;
  weeklyXp: number;
}

interface Props {
  leaderboard: Jugador[];
  userId: string;
  miPosicion: number;
  miXpSemanal: number;
  username: string;
  weekStart: string;
}

export default function LeaderboardClient({ leaderboard, userId, miPosicion, miXpSemanal, username, weekStart }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Día lunes de esta semana
  const fechaLunes = new Date(weekStart);
  const labelSemana = fechaLunes.toLocaleDateString("es-MX", { day: "numeric", month: "long" });

  const top3 = leaderboard.slice(0, 3);
  const resto = leaderboard.slice(3);

  const medallas = ["🥇", "🥈", "🥉"];
  const alturasPoio = [100, 75, 60]; // px de altura del podio

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D1117",
      color: "#F0F0EC",
      fontFamily: "Arial, sans-serif",
      paddingBottom: 90,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: "20px 20px 0",
        maxWidth: 480,
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Trophy size={22} color="#EF9F27" />
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#F0F0EC" }}>
            Ranking Semanal
          </h1>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "rgba(240,240,236,0.4)", letterSpacing: "0.04em" }}>
          Semana del {labelSemana} · XP ganado esta semana
        </p>

        {/* ── Mi posición ── */}
        {miXpSemanal > 0 ? (
          <div style={{
            backgroundColor: "#0F1A0F",
            border: "1px solid rgba(99,181,40,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#63B528" }}>
                #{miPosicion > 0 ? miPosicion : "—"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(240,240,236,0.6)" }}>
                Tu posición esta semana
              </span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#EF9F27" }}>
              {miXpSemanal} XP
            </span>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#0F1A0F",
            border: "1px solid rgba(45,90,45,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 24,
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(240,240,236,0.4)" }}>
              Aún no registraste actividades esta semana.{" "}
              <span
                style={{ color: "#63B528", cursor: "pointer" }}
                onClick={() => router.push("/tracker")}
              >
                ¡Empieza ahora!
              </span>
            </p>
          </div>
        )}
      </div>

      {/* ── Podio Top 3 ── */}
      {top3.length > 0 && (
        <div style={{
          maxWidth: 480,
          margin: "0 auto 24px",
          padding: "0 20px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 8,
            marginBottom: 0,
          }}>
            {/* 2do lugar */}
            {top3[1] && (
              <div onClick={() => router.push(`/@${top3[1].username}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  backgroundColor: "#1A2B1A",
                  border: `2px solid ${colorNivel(top3[1].level)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: colorNivel(top3[1].level),
                }}>
                  {top3[1].full_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: "rgba(240,240,236,0.7)", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  @{top3[1].username}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#EF9F27" }}>{top3[1].weeklyXp} XP</span>
                <div style={{
                  width: "100%", height: alturasPoio[1],
                  backgroundColor: "#1A2B1A",
                  border: "1px solid rgba(45,90,45,0.4)",
                  borderRadius: "6px 6px 0 0",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  paddingTop: 8,
                  fontSize: 22,
                }}>
                  🥈
                </div>
              </div>
            )}

            {/* 1er lugar */}
            {top3[0] && (
              <div onClick={() => router.push(`/@${top3[0].username}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  backgroundColor: "#1A2B1A",
                  border: `2px solid #FFD700`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: "#FFD700",
                  boxShadow: "0 0 12px rgba(255,215,0,0.3)",
                }}>
                  {top3[0].full_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: "#F0F0EC", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  @{top3[0].username}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#EF9F27" }}>{top3[0].weeklyXp} XP</span>
                <div style={{
                  width: "100%", height: alturasPoio[0],
                  backgroundColor: "#1A2B1A",
                  border: "1px solid rgba(255,215,0,0.3)",
                  borderRadius: "6px 6px 0 0",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  paddingTop: 8,
                  fontSize: 26,
                }}>
                  🥇
                </div>
              </div>
            )}

            {/* 3er lugar */}
            {top3[2] && (
              <div onClick={() => router.push(`/@${top3[2].username}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: "#1A2B1A",
                  border: `2px solid ${colorNivel(top3[2].level)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: colorNivel(top3[2].level),
                }}>
                  {top3[2].full_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: "rgba(240,240,236,0.7)", textAlign: "center", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  @{top3[2].username}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#EF9F27" }}>{top3[2].weeklyXp} XP</span>
                <div style={{
                  width: "100%", height: alturasPoio[2],
                  backgroundColor: "#1A2B1A",
                  border: "1px solid rgba(45,90,45,0.4)",
                  borderRadius: "6px 6px 0 0",
                  display: "flex", alignItems: "flex-start", justifyContent: "center",
                  paddingTop: 8,
                  fontSize: 18,
                }}>
                  🥉
                </div>
              </div>
            )}
          </div>

          {/* Base del podio */}
          <div style={{
            height: 6,
            backgroundColor: "#1A2B1A",
            border: "1px solid rgba(45,90,45,0.4)",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
          }} />
        </div>
      )}

      {/* ── Lista posiciones 4-20 ── */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>
        {resto.length > 0 && (
          <div style={{
            backgroundColor: "#0F1A0F",
            border: "1px solid rgba(45,90,45,0.3)",
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {resto.map((jugador, i) => {
              const posicion = i + 4;
              const esMio = jugador.id === userId;
              return (
                <div
                  key={jugador.id}
                  onClick={() => router.push(`/@${jugador.username}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 16px",
                    borderBottom: i < resto.length - 1 ? "1px solid rgba(45,90,45,0.2)" : "none",
                    cursor: "pointer",
                    backgroundColor: esMio ? "rgba(99,181,40,0.06)" : "transparent",
                    transition: "background-color 0.2s",
                  }}
                >
                  {/* Posición */}
                  <span style={{
                    width: 28, fontSize: 13, fontWeight: 600,
                    color: "rgba(240,240,236,0.4)",
                    flexShrink: 0,
                  }}>
                    #{posicion}
                  </span>

                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    backgroundColor: "#0D1117",
                    border: `1.5px solid ${colorNivel(jugador.level)}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: colorNivel(jugador.level),
                    marginRight: 10, flexShrink: 0,
                  }}>
                    {jugador.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: esMio ? 700 : 500, color: "#F0F0EC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {jugador.full_name} {esMio && <span style={{ color: "#63B528", fontSize: 11 }}>· tú</span>}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(240,240,236,0.4)" }}>
                      @{jugador.username} · Nv.{jugador.level} {nombreNivel(jugador.level)}
                    </p>
                  </div>

                  {/* XP semanal */}
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#EF9F27", flexShrink: 0 }}>
                    {jugador.weeklyXp} XP
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Estado vacío */}
        {leaderboard.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(240,240,236,0.4)",
          }}>
            <Trophy size={40} color="rgba(240,240,236,0.15)" style={{ marginBottom: 12 }} />
            <p style={{ margin: "0 0 8px", fontSize: 15, color: "rgba(240,240,236,0.6)" }}>
              Nadie ha registrado actividades esta semana
            </p>
            <p style={{ margin: 0, fontSize: 13 }}>
              ¡Sé el primero en aparecer aquí!
            </p>
            <button
              onClick={() => router.push("/tracker")}
              style={{
                marginTop: 20,
                backgroundColor: "#63B528",
                color: "#0D1117",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Registrar actividad
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#0D1117",
        borderTop: "1px solid rgba(45,90,45,0.3)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 16px",
      }}>
        {[
          { id: "home",        icon: <Home size={20} />,    label: "Inicio",   ruta: "/dashboard" },
          { id: "tracker",     icon: <Zap size={20} />,     label: "Tracker",  ruta: "/tracker" },
          { id: "leaderboard", icon: <Trophy size={20} />,  label: "Ranking",  ruta: "/leaderboard" },
          { id: "comunidades", icon: <Users size={20} />,   label: "Comunidad",ruta: "/comunidades" },
          { id: "perfil",      icon: <User size={20} />,    label: "Perfil",   ruta: "/perfil" },
        ].map(({ id, icon, label, ruta }) => (
          <button key={id}
            onClick={() => router.push(ruta)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: id === "leaderboard" ? "#63B528" : "rgba(240,240,236,0.3)",
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
