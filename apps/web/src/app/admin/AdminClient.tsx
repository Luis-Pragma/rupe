"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Zap, Activity, Trophy, Search, ChevronDown, ChevronUp, Crown } from "lucide-react";

function colorNivel(nivel: number) {
  if (nivel <= 3) return "#63B528";
  if (nivel <= 6) return "#EF9F27";
  if (nivel <= 8) return "#7F77DD";
  return "#FFD700";
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

interface Usuario {
  id: string;
  username: string;
  full_name: string;
  email: string;
  level: number;
  xp: number;
  streak_days: number;
  is_premium: boolean;
  created_at: string;
  totalActividades: number;
}

interface Stats {
  totalUsuarios: number;
  totalActividades: number;
  topUsuarios: Array<{ id: string; username: string; full_name: string; xp: number; level: number }>;
}

interface Props {
  usuarios: Usuario[];
  stats: Stats;
}

export default function AdminClient({ usuarios, stats }: Props) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [orden, setOrden] = useState<"reciente" | "xp" | "actividades">("reciente");

  const usuariosFiltrados = usuarios
    .filter(u =>
      u.full_name.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      if (orden === "xp") return b.xp - a.xp;
      if (orden === "actividades") return b.totalActividades - a.totalActividades;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        display: "flex", alignItems: "center", gap: 14,
        background: "linear-gradient(135deg, #0f1f0f 0%, #0D1117 100%)",
      }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, padding: "8px 10px", cursor: "pointer",
            color: "rgba(240,240,236,0.6)", display: "flex", alignItems: "center",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Crown size={16} color="#EF9F27" />
            <h1 style={{ color: "#F0F0EC", fontSize: 18, fontWeight: 700, margin: 0 }}>
              Panel de Admin
            </h1>
          </div>
          <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 12, margin: "2px 0 0" }}>
            Vista interna — solo tú puedes ver esto
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Stats generales ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { icon: <Users size={18} color="#63B528" />, valor: stats.totalUsuarios, label: "Usuarios", bg: "rgba(99,181,40,0.08)", border: "rgba(99,181,40,0.2)" },
            { icon: <Activity size={18} color="#7F77DD" />, valor: stats.totalActividades, label: "Actividades", bg: "rgba(127,119,221,0.08)", border: "rgba(127,119,221,0.2)" },
            { icon: <Zap size={18} color="#EF9F27" />, valor: Math.round(stats.totalActividades / Math.max(stats.totalUsuarios, 1)), label: "Prom/usuario", bg: "rgba(239,159,39,0.08)", border: "rgba(239,159,39,0.2)" },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 14, padding: "14px 12px",
              textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
              <p style={{ color: "#F0F0EC", fontSize: 20, fontWeight: 800, margin: 0 }}>
                {s.valor.toLocaleString()}
              </p>
              <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 10, margin: "3px 0 0", letterSpacing: 0.5 }}>
                {s.label.toUpperCase()}
              </p>
            </div>
          ))}
        </div>

        {/* ── Top 3 usuarios ── */}
        <div style={{
          backgroundColor: "#0F1A0F",
          border: "1px solid rgba(45,90,45,0.3)",
          borderRadius: 16, padding: 16, marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Trophy size={15} color="#EF9F27" />
            <p style={{ color: "#F0F0EC", fontSize: 13, fontWeight: 700, margin: 0 }}>Top usuarios por XP</p>
          </div>
          {stats.topUsuarios.map((u, i) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 0",
              borderBottom: i < stats.topUsuarios.length - 1 ? "1px solid rgba(45,90,45,0.1)" : "none",
            }}>
              <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: `${colorNivel(u.level)}18`,
                border: `2px solid ${colorNivel(u.level)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: colorNivel(u.level),
              }}>
                {u.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#F0F0EC", fontSize: 13, fontWeight: 600, margin: 0 }}>{u.full_name}</p>
                <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: 0 }}>@{u.username}</p>
              </div>
              <p style={{ color: colorNivel(u.level), fontSize: 13, fontWeight: 700, margin: 0 }}>
                {u.xp.toLocaleString()} XP
              </p>
            </div>
          ))}
        </div>

        {/* ── Búsqueda y orden ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} color="rgba(240,240,236,0.3)"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                width: "100%", backgroundColor: "#0F1A0F",
                border: "1px solid rgba(45,90,45,0.3)",
                borderRadius: 10, padding: "9px 12px 9px 34px",
                color: "#F0F0EC", fontSize: 13, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={orden}
            onChange={e => setOrden(e.target.value as typeof orden)}
            style={{
              backgroundColor: "#0F1A0F",
              border: "1px solid rgba(45,90,45,0.3)",
              borderRadius: 10, padding: "9px 12px",
              color: "#F0F0EC", fontSize: 12, outline: "none", cursor: "pointer",
            }}
          >
            <option value="reciente">Más reciente</option>
            <option value="xp">Mayor XP</option>
            <option value="actividades">Más activo</option>
          </select>
        </div>

        {/* ── Conteo ── */}
        <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: "0 0 12px 2px" }}>
          {usuariosFiltrados.length} USUARIO{usuariosFiltrados.length !== 1 ? "S" : ""}
        </p>

        {/* ── Lista de usuarios ── */}
        {usuariosFiltrados.map(usuario => {
          const color = colorNivel(usuario.level);
          const abierto = expandido === usuario.id;

          return (
            <div key={usuario.id} style={{
              backgroundColor: "#0F1A0F",
              border: `1px solid ${abierto ? color + "44" : "rgba(45,90,45,0.2)"}`,
              borderRadius: 14,
              marginBottom: 8,
              overflow: "hidden",
              transition: "border-color 0.2s ease",
            }}>
              {/* Fila principal */}
              <div
                onClick={() => setExpandido(abierto ? null : usuario.id)}
                style={{
                  padding: "13px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: `${color}15`,
                  border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color,
                  flexShrink: 0,
                }}>
                  {usuario.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 600 }}>
                      {usuario.full_name}
                    </span>
                    {usuario.is_premium && (
                      <span style={{ fontSize: 10 }}>⭐</span>
                    )}
                    <span style={{
                      backgroundColor: color, color: "#0D1117",
                      fontSize: 9, fontWeight: 800,
                      padding: "1px 5px", borderRadius: 5,
                    }}>
                      Nv {usuario.level}
                    </span>
                  </div>
                  <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "2px 0 0" }}>
                    @{usuario.username} · {usuario.totalActividades} actividades
                  </p>
                </div>

                {/* XP + flecha */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ color, fontSize: 13, fontWeight: 700, margin: 0 }}>
                    {usuario.xp.toLocaleString()}
                  </p>
                  <p style={{ color: "rgba(240,240,236,0.2)", fontSize: 10, margin: "1px 0 0" }}>XP</p>
                </div>
                <div style={{ color: "rgba(240,240,236,0.25)", marginLeft: 4 }}>
                  {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Detalle expandido */}
              {abierto && (
                <div style={{
                  borderTop: "1px solid rgba(45,90,45,0.15)",
                  padding: "14px 16px",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      { label: "Email", valor: usuario.email },
                      { label: "Registrado", valor: fechaCorta(usuario.created_at) },
                      { label: "Racha actual", valor: `${usuario.streak_days} días 🔥` },
                      { label: "Total actividades", valor: usuario.totalActividades.toString() },
                    ].map(({ label, valor }) => (
                      <div key={label} style={{
                        backgroundColor: "#0F1A0F",
                        border: "1px solid rgba(45,90,45,0.15)",
                        borderRadius: 10, padding: "10px 12px",
                      }}>
                        <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, margin: "0 0 4px" }}>
                          {label.toUpperCase()}
                        </p>
                        <p style={{ color: "#F0F0EC", fontSize: 13, margin: 0, wordBreak: "break-all" }}>
                          {valor}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Botón ver perfil público */}
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/${usuario.username}`); }}
                    style={{
                      width: "100%",
                      backgroundColor: `${color}15`,
                      border: `1px solid ${color}44`,
                      borderRadius: 10, padding: "9px",
                      color, fontSize: 13, fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Ver perfil público →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
