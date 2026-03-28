"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Zap, Users, User, Send, Flame, Check, X } from "lucide-react";
import { invitarRachaCompartida, aceptarInvitacion, cancelarRacha } from "./actions";

function colorNivel(nivel: number): string {
  if (nivel <= 3) return "#63B528";
  if (nivel <= 6) return "#EF9F27";
  if (nivel <= 8) return "#7F77DD";
  return "#FFD700";
}

function tiempoDesde(fecha: string): string {
  const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  if (segundos < 3600) return `${Math.floor(segundos / 60)}m`;
  if (segundos < 86400) return `${Math.floor(segundos / 3600)}h`;
  return `${Math.floor(segundos / 86400)}d`;
}

interface Racha {
  id: string;
  streak_days: number;
  status: string;
  invited_at: string;
  soyInvitador: boolean;
  miUltimaActividad: string | null;
  suUltimaActividad: string | null;
  companero: { id: string; username: string; full_name: string; level: number; streak_days: number } | null;
}

interface Props {
  rachas: Racha[];
  userId: string;
  tablaMissing: boolean;
}

export default function RachaCompartidaClient({ rachas: rachasIniciales, userId, tablaMissing }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [rachas, setRachas] = useState<Racha[]>(rachasIniciales);
  const [input, setInput] = useState("");
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.4s ease ${ms}ms, transform 0.4s ease ${ms}ms`,
  });

  async function enviarInvitacion() {
    if (!input.trim() || isPending) return;
    startTransition(async () => {
      const res = await invitarRachaCompartida(input.trim());
      if (res.ok) {
        setMensaje({ texto: `Invitación enviada a @${res.companero}`, tipo: "ok" });
        setInput("");
      } else {
        setMensaje({ texto: res.error ?? "Error", tipo: "error" });
      }
      setTimeout(() => setMensaje(null), 3000);
    });
  }

  function handleAceptar(rachaId: string) {
    setRachas(prev => prev.map(r => r.id === rachaId ? { ...r, status: "active" } : r));
    startTransition(() => aceptarInvitacion(rachaId));
  }

  function handleCancelar(rachaId: string) {
    setRachas(prev => prev.filter(r => r.id !== rachaId));
    startTransition(() => cancelarRacha(rachaId));
  }

  const activas = rachas.filter(r => r.status === "active");
  const pendientes = rachas.filter(r => r.status === "pending");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        ...delay(0),
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/perfil")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,240,236,0.5)", padding: 0 }}
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 style={{ color: "#F0F0EC", fontSize: 22, fontWeight: 700, margin: 0 }}>
              🔥 Racha Compartida
            </h1>
            <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 13, margin: "2px 0 0" }}>
              Mantén la racha con un amigo
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* ── Aviso si tabla no existe ── */}
        {tablaMissing && (
          <div style={{
            backgroundColor: "rgba(239,159,39,0.1)",
            border: "1px solid rgba(239,159,39,0.3)",
            borderRadius: 14, padding: 16, marginBottom: 16,
            ...delay(50),
          }}>
            <p style={{ color: "#EF9F27", fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>
              ⚠️ Configuración pendiente
            </p>
            <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, margin: 0 }}>
              Para activar rachas compartidas, ve a Supabase → SQL Editor y ejecuta el archivo <code>docs/SQL_RACHA_COMPARTIDA.sql</code> del proyecto.
            </p>
          </div>
        )}

        {/* ── Cómo funciona ── */}
        <div style={{
          backgroundColor: "#0F1A0F",
          borderRadius: 16, border: "1px solid rgba(45,90,45,0.25)",
          padding: 16, marginBottom: 16,
          ...delay(100),
        }}>
          <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
            ¿Cómo funciona?
          </p>
          {[
            { emoji: "1️⃣", texto: "Invita a un amigo por su @usuario" },
            { emoji: "2️⃣", texto: "Ambos deben registrar al menos 1 actividad por día" },
            { emoji: "3️⃣", texto: "La racha crece para los dos. Si uno falla, se rompe para ambos" },
          ].map(item => (
            <div key={item.emoji} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>{item.emoji}</span>
              <p style={{ color: "rgba(240,240,236,0.6)", fontSize: 13, margin: 0 }}>{item.texto}</p>
            </div>
          ))}
        </div>

        {/* ── Invitar ── */}
        <div style={{
          backgroundColor: "#0F1A0F",
          borderRadius: 16, border: "1px solid rgba(45,90,45,0.25)",
          padding: 16, marginBottom: 16,
          ...delay(150),
        }}>
          <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 600, margin: "0 0 10px" }}>
            Invitar a un amigo
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && enviarInvitacion()}
              placeholder="@usuario o nombre de usuario"
              style={{
                flex: 1, backgroundColor: "#1a2e1a",
                border: "1px solid rgba(45,90,45,0.3)",
                borderRadius: 12, padding: "10px 14px",
                color: "#F0F0EC", fontSize: 13, outline: "none",
              }}
            />
            <button
              onClick={enviarInvitacion}
              disabled={isPending || !input.trim()}
              style={{
                backgroundColor: input.trim() ? "#63B528" : "rgba(99,181,40,0.2)",
                border: "none", borderRadius: 12,
                padding: "10px 16px", cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 6,
                color: input.trim() ? "#fff" : "rgba(240,240,236,0.3)",
                fontSize: 13, fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <Send size={14} />
              Invitar
            </button>
          </div>
          {mensaje && (
            <p style={{
              color: mensaje.tipo === "ok" ? "#63B528" : "#F87171",
              fontSize: 12, marginTop: 8,
            }}>
              {mensaje.tipo === "ok" ? "✓" : "✗"} {mensaje.texto}
            </p>
          )}
        </div>

        {/* ── Pendientes (invitaciones recibidas) ── */}
        {pendientes.filter(r => !r.soyInvitador).length > 0 && (
          <div style={{ marginBottom: 16, ...delay(200) }}>
            <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Invitaciones recibidas
            </p>
            {pendientes.filter(r => !r.soyInvitador).map(racha => (
              <div key={racha.id} style={{
                backgroundColor: "#0F1A0F",
                borderRadius: 14, border: "1px solid rgba(239,159,39,0.3)",
                padding: "12px 14px", marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  backgroundColor: "rgba(99,181,40,0.1)",
                  border: `2px solid ${colorNivel(racha.companero?.level ?? 1)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#63B528", fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {racha.companero?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#F0F0EC", fontSize: 13, fontWeight: 600, margin: 0 }}>
                    {racha.companero?.full_name ?? "Usuario"}
                  </p>
                  <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 11, margin: "2px 0 0" }}>
                    @{racha.companero?.username} quiere compartir racha contigo
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleAceptar(racha.id)} style={{
                    backgroundColor: "#63B528", border: "none", borderRadius: "50%",
                    width: 32, height: 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={14} color="#fff" />
                  </button>
                  <button onClick={() => handleCancelar(racha.id)} style={{
                    backgroundColor: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <X size={14} color="#F87171" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Rachas activas ── */}
        {activas.length > 0 && (
          <div style={{ ...delay(250) }}>
            <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              Rachas activas
            </p>
            {activas.map(racha => {
              const hoy = new Date().toISOString().split("T")[0];
              const yoRegistreHoy = racha.miUltimaActividad?.startsWith(hoy);
              const elRegistroHoy = racha.suUltimaActividad?.startsWith(hoy);

              return (
                <div key={racha.id} style={{
                  backgroundColor: "#0F1A0F",
                  borderRadius: 16, border: "1px solid rgba(239,159,39,0.3)",
                  padding: 16, marginBottom: 12,
                }}>
                  {/* Cabecera */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        backgroundColor: "rgba(99,181,40,0.1)",
                        border: `2px solid ${colorNivel(racha.companero?.level ?? 1)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#63B528", fontWeight: 700, fontSize: 14,
                      }}>
                        {racha.companero?.full_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p style={{ color: "#F0F0EC", fontSize: 13, fontWeight: 600, margin: 0 }}>
                          {racha.companero?.full_name}
                        </p>
                        <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 11, margin: "2px 0 0" }}>
                          @{racha.companero?.username}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Flame size={20} color="#EF9F27" />
                        <span style={{ color: "#EF9F27", fontSize: 28, fontWeight: 700 }}>
                          {racha.streak_days}
                        </span>
                      </div>
                      <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 10, margin: 0 }}>días juntos</p>
                    </div>
                  </div>

                  {/* Estado de hoy */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{
                      backgroundColor: yoRegistreHoy ? "rgba(99,181,40,0.1)" : "rgba(45,90,45,0.05)",
                      borderRadius: 10, padding: "8px 12px",
                      border: `1px solid ${yoRegistreHoy ? "rgba(99,181,40,0.3)" : "rgba(45,90,45,0.15)"}`,
                      textAlign: "center",
                    }}>
                      <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 10, margin: "0 0 4px" }}>Tú hoy</p>
                      <span style={{ fontSize: 18 }}>{yoRegistreHoy ? "✅" : "⏳"}</span>
                    </div>
                    <div style={{
                      backgroundColor: elRegistroHoy ? "rgba(99,181,40,0.1)" : "rgba(45,90,45,0.05)",
                      borderRadius: 10, padding: "8px 12px",
                      border: `1px solid ${elRegistroHoy ? "rgba(99,181,40,0.3)" : "rgba(45,90,45,0.15)"}`,
                      textAlign: "center",
                    }}>
                      <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 10, margin: "0 0 4px" }}>
                        {racha.companero?.username} hoy
                      </p>
                      <span style={{ fontSize: 18 }}>{elRegistroHoy ? "✅" : "⏳"}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCancelar(racha.id)}
                    style={{
                      marginTop: 12, width: "100%",
                      backgroundColor: "transparent",
                      border: "1px solid rgba(248,113,113,0.2)",
                      borderRadius: 10, padding: "6px",
                      color: "rgba(248,113,113,0.5)", fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    Terminar racha
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!tablaMissing && activas.length === 0 && pendientes.length === 0 && (
          <div style={{
            textAlign: "center", padding: "32px 20px",
            color: "rgba(240,240,236,0.3)",
            ...delay(200),
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
            <p style={{ fontSize: 14, margin: 0 }}>No tienes rachas compartidas</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>
              Invita a un amigo para mantenerse motivados juntos
            </p>
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
          { icon: <Home size={22} />, label: "Inicio", ruta: "/dashboard" },
          { icon: <Zap size={22} />, label: "Tracker", ruta: "/tracker" },
          { icon: <Users size={22} />, label: "Comunidad", ruta: "/comunidades" },
          { icon: <User size={22} />, label: "Perfil", ruta: "/perfil" },
        ].map(({ icon, label, ruta }) => (
          <button key={ruta}
            onClick={() => router.push(ruta)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: "rgba(240,240,236,0.3)", fontSize: 10, letterSpacing: 0.5,
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
