"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Plus, CheckCircle, Clock, Link, ChevronDown, X, ArrowLeft, Home, Users, User } from "lucide-react";
import { registrarActividad } from "./actions";

const CATEGORIAS = [
  { id: "content",  label: "Contenido",   emoji: "📹", color: "#63B528" },
  { id: "finance",  label: "Finanzas",    emoji: "💰", color: "#EF9F27" },
  { id: "learning", label: "Aprendizaje", emoji: "📚", color: "#7F77DD" },
  { id: "social",   label: "Social",      emoji: "🤝", color: "#63B528" },
  { id: "health",   label: "Salud",       emoji: "💪", color: "#EF9F27" },
];

interface Actividad {
  id: string;
  title: string;
  category: string;
  description: string | null;
  xp_earned: number;
  created_at: string;
}

interface Props {
  actividades: Actividad[];
  xpHoy: number;
  techo: number;
}

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const min  = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 1)   return "ahora mismo";
  if (min < 60)  return `hace ${min}m`;
  if (hrs < 24)  return `hace ${hrs}h`;
  return `hace ${dias}d`;
}

export default function TrackerClient({ actividades: inicial, xpHoy, techo }: Props) {
  const [actividades, setActividades] = useState(inicial);
  const [xpGanadoHoy, setXpGanadoHoy] = useState(xpHoy);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [mostrarPrueba, setMostrarPrueba] = useState(false);
  const [resultado, setResultado] = useState<{ xpGanado: number; techoAlcanzado: boolean; nivelNuevo: boolean; insigniasNuevas?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.4s ease ${ms}ms, transform 0.4s ease ${ms}ms`,
  });

  const progresoPct = Math.min(100, (xpGanadoHoy / techo) * 100);
  const categoriaInfo = CATEGORIAS.find(c => c.id === categoriaSeleccionada);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const res = await registrarActividad(data);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.ok) {
        setResultado({
          xpGanado: res.xpGanado!,
          techoAlcanzado: res.techoAlcanzado!,
          nivelNuevo: res.nivelNuevo!,
          insigniasNuevas: res.insigniasNuevas ?? [],
        });
        setXpGanadoHoy(prev => Math.min(techo, prev + res.xpGanado!));
        // Añadir al feed local sin recargar
        const nueva: Actividad = {
          id: crypto.randomUUID(),
          title: data.get("titulo") as string,
          category: data.get("categoria") as string,
          description: data.get("descripcion") as string || null,
          xp_earned: res.xpGanado!,
          created_at: new Date().toISOString(),
        };
        setActividades(prev => [nueva, ...prev]);
        form.reset();
        setCategoriaSeleccionada("");
        setMostrarForm(false);
        setMostrarPrueba(false);
        setTimeout(() => setResultado(null), 4000);
      }
    });
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        display: "flex", alignItems: "center", gap: 12,
        ...delay(0),
      }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(240,240,236,0.5)", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 style={{ color: "#F0F0EC", fontSize: 20, fontWeight: 700, margin: 0 }}>
            Tracker
          </h1>
          <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 12, margin: 0 }}>
            Registra lo que hiciste hoy
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ── Barra XP del día ── */}
        <div style={{ marginTop: 20, ...delay(80) }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              XP de hoy
            </span>
            <span style={{ color: xpGanadoHoy >= techo ? "#EF9F27" : "#63B528", fontSize: 12, fontWeight: 600 }}>
              {xpGanadoHoy} / {techo} XP
              {xpGanadoHoy >= techo && " · Techo alcanzado 🔥"}
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 4,
            backgroundColor: "rgba(99,181,40,0.1)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: 4,
              backgroundColor: xpGanadoHoy >= techo ? "#EF9F27" : "#63B528",
              width: `${progresoPct}%`,
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
        </div>

        {/* ── Toast de resultado ── */}
        {resultado && (
          <div style={{
            marginTop: 12,
            backgroundColor: resultado.nivelNuevo ? "#7F77DD" : "#0F1A0F",
            border: `1px solid ${resultado.nivelNuevo ? "#7F77DD" : "#63B528"}`,
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10,
            animation: "fadeIn 0.3s ease",
          }}>
            <CheckCircle size={18} color={resultado.nivelNuevo ? "#fff" : "#63B528"} />
            <div>
              <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 600, margin: 0 }}>
                {resultado.nivelNuevo ? "¡Subiste de nivel! 🎉" : "Actividad registrada"}
              </p>
              <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, margin: 0 }}>
                +{resultado.xpGanado} XP
                {resultado.techoAlcanzado && " · Techo diario alcanzado"}
              </p>
              {resultado.insigniasNuevas && resultado.insigniasNuevas.length > 0 && (
                <p style={{ color: "#FFD700", fontSize: 12, margin: "4px 0 0", fontWeight: 600 }}>
                  🏆 ¡Nueva insignia!: {resultado.insigniasNuevas.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Botón registrar / Formulario ── */}
        {!mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            style={{
              marginTop: 16, width: "100%",
              backgroundColor: xpGanadoHoy >= techo ? "rgba(99,181,40,0.15)" : "#63B528",
              border: xpGanadoHoy >= techo ? "1px solid rgba(99,181,40,0.3)" : "none",
              borderRadius: 14, padding: "16px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: xpGanadoHoy >= techo ? "default" : "pointer",
              color: xpGanadoHoy >= techo ? "rgba(99,181,40,0.5)" : "#fff",
              fontSize: 16, fontWeight: 600,
              ...delay(120),
            }}
            disabled={xpGanadoHoy >= techo}
          >
            <Plus size={20} />
            {xpGanadoHoy >= techo ? "Techo diario alcanzado 🔥" : "Registrar actividad"}
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: 16,
              backgroundColor: "#0F1A0F",
              border: "1px solid rgba(45,90,45,0.4)",
              borderRadius: 16, padding: 20,
              ...delay(0),
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: "#F0F0EC", fontWeight: 600, margin: 0 }}>
                Nueva actividad
              </p>
              <button type="button" onClick={() => setMostrarForm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,240,236,0.4)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Categoría */}
            <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>
              Categoría
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
              {CATEGORIAS.map(cat => (
                <button key={cat.id} type="button"
                  onClick={() => setCategoriaSeleccionada(cat.id)}
                  style={{
                    background: categoriaSeleccionada === cat.id
                      ? `rgba(${cat.id === "learning" ? "127,119,221" : cat.id === "finance" || cat.id === "health" ? "239,159,39" : "99,181,40"},0.2)`
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${categoriaSeleccionada === cat.id ? cat.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 10, padding: "10px 4px",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 9, color: "rgba(240,240,236,0.5)", letterSpacing: 0.5 }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
            <input type="hidden" name="categoria" value={categoriaSeleccionada} />

            {/* Título */}
            <input
              name="titulo"
              placeholder="¿Qué hiciste?"
              required
              maxLength={120}
              style={{
                width: "100%", padding: "12px 14px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#F0F0EC", fontSize: 15,
                outline: "none", boxSizing: "border-box", marginBottom: 10,
              }}
            />

            {/* Descripción */}
            <textarea
              name="descripcion"
              placeholder="Describe brevemente (opcional)"
              rows={2}
              maxLength={300}
              style={{
                width: "100%", padding: "12px 14px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#F0F0EC", fontSize: 14,
                outline: "none", resize: "none", boxSizing: "border-box",
                marginBottom: 10, fontFamily: "inherit",
              }}
            />

            {/* Prueba (opcional, da +20 XP) */}
            <button type="button"
              onClick={() => setMostrarPrueba(!mostrarPrueba)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#63B528", fontSize: 13, display: "flex",
                alignItems: "center", gap: 6, marginBottom: mostrarPrueba ? 10 : 16,
                padding: 0,
              }}
            >
              <Link size={14} />
              Agregar prueba +20 XP
              <ChevronDown size={14} style={{ transform: mostrarPrueba ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {mostrarPrueba && (
              <input
                name="prueba"
                type="url"
                placeholder="https://... (link a tu publicación, video, etc)"
                style={{
                  width: "100%", padding: "12px 14px",
                  backgroundColor: "rgba(99,181,40,0.08)",
                  border: "1px solid rgba(99,181,40,0.3)",
                  borderRadius: 10, color: "#F0F0EC", fontSize: 14,
                  outline: "none", boxSizing: "border-box", marginBottom: 16,
                }}
              />
            )}

            {error && (
              <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{error}</p>
            )}

            {/* XP preview */}
            <div style={{
              backgroundColor: "rgba(99,181,40,0.06)",
              border: "1px solid rgba(99,181,40,0.15)",
              borderRadius: 8, padding: "8px 12px",
              display: "flex", justifyContent: "space-between",
              marginBottom: 14,
            }}>
              <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 12 }}>XP a ganar</span>
              <span style={{ color: "#63B528", fontSize: 12, fontWeight: 600 }}>
                +{mostrarPrueba ? 70 : 50} XP
                {xpGanadoHoy + (mostrarPrueba ? 70 : 50) >= techo && " (parcial — techo)"}
              </span>
            </div>

            <button type="submit" disabled={isPending || !categoriaSeleccionada}
              style={{
                width: "100%", backgroundColor: categoriaSeleccionada ? "#63B528" : "rgba(99,181,40,0.2)",
                border: "none", borderRadius: 12, padding: "14px",
                color: categoriaSeleccionada ? "#fff" : "rgba(240,240,236,0.3)",
                fontSize: 15, fontWeight: 600, cursor: categoriaSeleccionada ? "pointer" : "default",
                transition: "background 0.2s",
              }}
            >
              {isPending ? "Guardando..." : "Guardar actividad"}
            </button>
          </form>
        )}

        {/* ── Historial ── */}
        <div style={{ marginTop: 24, ...delay(160) }}>
          <p style={{
            color: "rgba(240,240,236,0.4)", fontSize: 12,
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 12,
          }}>
            Historial reciente
          </p>

          {actividades.length === 0 ? (
            <div style={{
              backgroundColor: "#0F1A0F",
              borderRadius: 14,
              border: "1px solid rgba(45,90,45,0.2)",
              padding: "32px 20px", textAlign: "center",
            }}>
              <span style={{ fontSize: 36 }}>⚡</span>
              <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 14, margin: "10px 0 4px" }}>
                Aún no hay actividades
              </p>
              <p style={{ color: "rgba(240,240,236,0.2)", fontSize: 12, margin: 0 }}>
                Registra tu primera actividad arriba
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actividades.map((act, i) => {
                const cat = CATEGORIAS.find(c => c.id === act.category);
                return (
                  <div key={act.id}
                    style={{
                      backgroundColor: "#0F1A0F",
                      borderRadius: 14,
                      border: "1px solid rgba(45,90,45,0.2)",
                      padding: "14px 16px",
                      display: "flex", alignItems: "flex-start", gap: 12,
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 0.3s ease ${200 + i * 50}ms, transform 0.3s ease ${200 + i * 50}ms`,
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>
                      {cat?.emoji ?? "⚡"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 600, margin: 0 }}>
                        {act.title}
                      </p>
                      {act.description && (
                        <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 12, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {act.description}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <span style={{
                          backgroundColor: "rgba(99,181,40,0.1)",
                          color: "#63B528", fontSize: 11, fontWeight: 600,
                          padding: "2px 8px", borderRadius: 6,
                        }}>
                          +{act.xp_earned} XP
                        </span>
                        <span style={{ color: "rgba(240,240,236,0.25)", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock size={10} />
                          {tiempoRelativo(act.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
          { id: "home",        icon: <Home size={22} />,  label: "Inicio",    ruta: "/dashboard" },
          { id: "tracker",     icon: <Zap size={22} />,   label: "Tracker",   ruta: "/tracker" },
          { id: "comunidades", icon: <Users size={22} />, label: "Comunidad", ruta: "/comunidades" },
          { id: "perfil",      icon: <User size={22} />,  label: "Perfil",    ruta: "/perfil" },
        ].map(({ id, icon, label, ruta }) => (
          <button key={id}
            onClick={() => router.push(ruta)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: id === "tracker" ? "#63B528" : "rgba(240,240,236,0.3)",
              transition: "color 0.2s ease",
              fontSize: 10, letterSpacing: 0.5,
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
