"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, Zap, Users, User, ArrowLeft, X, Trophy } from "lucide-react";
import { buscarUsuarios } from "./actions";

function colorNivel(nivel: number) {
  if (nivel <= 3) return "#63B528";
  if (nivel <= 6) return "#EF9F27";
  if (nivel <= 8) return "#7F77DD";
  return "#FFD700";
}

function nombreNivel(nivel: number) {
  const NIVELES = ["Semilla","Brote","Raíz","Tallo","Hoja","Rama","Copa","Árbol","Bosque","Ecosistema"];
  return NIVELES[nivel - 1] ?? "Ecosistema";
}

interface Usuario {
  id: string;
  username: string;
  full_name: string;
  level: number;
  xp: number;
  streak_days: number;
}

export default function BuscarClient() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Usuario[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function buscar(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResultados([]);
      setBuscado(false);
      return;
    }
    startTransition(async () => {
      const data = await buscarUsuarios(q);
      setResultados(data as Usuario[]);
      setBuscado(true);
    });
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        display: "flex", alignItems: "center", gap: 14,
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
        <div>
          <h1 style={{ color: "#F0F0EC", fontSize: 18, fontWeight: 700, margin: 0 }}>
            Buscar usuarios
          </h1>
          <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 12, margin: "2px 0 0" }}>
            Encuentra personas por nombre o @username
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 0" }}>

        {/* ── Input de búsqueda ── */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search
            size={16}
            color={isPending ? "#63B528" : "rgba(240,240,236,0.3)"}
            style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)",
              transition: "color 0.2s ease",
            }}
          />
          <input
            autoFocus
            type="text"
            placeholder="Buscar por nombre o @username..."
            value={query}
            onChange={e => buscar(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "#0F1A0F",
              border: "1px solid rgba(45,90,45,0.4)",
              borderRadius: 14,
              padding: "13px 40px 13px 40px",
              color: "#F0F0EC",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(99,181,40,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(45,90,45,0.4)"}
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(""); setResultados([]); setBuscado(false); }}
              style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(240,240,236,0.3)", display: "flex",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Estado vacío inicial ── */}
        {!buscado && query.length < 2 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 14, margin: 0 }}>
              Escribe al menos 2 caracteres para buscar
            </p>
          </div>
        )}

        {/* ── Cargando ── */}
        {isPending && (
          <div style={{ textAlign: "center", padding: "32px 20px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "3px solid rgba(99,181,40,0.2)",
              borderTopColor: "#63B528",
              margin: "0 auto 12px",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 13, margin: 0 }}>
              Buscando...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Sin resultados ── */}
        {buscado && !isPending && resultados.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😶</div>
            <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 14, margin: 0 }}>
              No encontramos a nadie con ese nombre
            </p>
            <p style={{ color: "rgba(240,240,236,0.25)", fontSize: 12, margin: "6px 0 0" }}>
              Prueba con otro nombre o @username
            </p>
          </div>
        )}

        {/* ── Resultados ── */}
        {!isPending && resultados.length > 0 && (
          <div>
            <p style={{
              color: "rgba(240,240,236,0.3)", fontSize: 11, fontWeight: 700,
              letterSpacing: 1.5, margin: "0 0 12px 4px",
            }}>
              {resultados.length} RESULTADO{resultados.length !== 1 ? "S" : ""}
            </p>
            {resultados.map((usuario, i) => {
              const color = colorNivel(usuario.level);
              const inicial = usuario.full_name?.charAt(0)?.toUpperCase() ?? "?";

              return (
                <div
                  key={usuario.id}
                  onClick={() => router.push(`/${usuario.username}`)}
                  style={{
                    backgroundColor: "#0F1A0F",
                    border: "1px solid rgba(45,90,45,0.25)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", gap: 14,
                    cursor: "pointer",
                    opacity: 0,
                    animation: `fadeUp 0.35s ease ${i * 50}ms forwards`,
                    transition: "border-color 0.2s ease, background-color 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}44`;
                    e.currentTarget.style.backgroundColor = "#111f11";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(45,90,45,0.25)";
                    e.currentTarget.style.backgroundColor = "#0F1A0F";
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    backgroundColor: `${color}18`,
                    border: `2px solid ${color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color,
                    flexShrink: 0,
                  }}>
                    {inicial}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#F0F0EC", fontSize: 15, fontWeight: 600 }}>
                        {usuario.full_name}
                      </span>
                      <span style={{
                        backgroundColor: color,
                        color: "#0D1117",
                        fontSize: 9, fontWeight: 800,
                        padding: "2px 6px", borderRadius: 6,
                        letterSpacing: 0.5, flexShrink: 0,
                      }}>
                        Nv {usuario.level}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
                      <span style={{ color: "rgba(240,240,236,0.4)", fontSize: 12 }}>
                        @{usuario.username}
                      </span>
                      <span style={{ color: "rgba(240,240,236,0.2)", fontSize: 11 }}>·</span>
                      <span style={{ color: color, fontSize: 11, fontWeight: 600 }}>
                        {nombreNivel(usuario.level)}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                      <span style={{ color: "rgba(240,240,236,0.35)", fontSize: 11 }}>
                        ⚡ {usuario.xp.toLocaleString()} XP
                      </span>
                      <span style={{ color: "rgba(240,240,236,0.35)", fontSize: 11 }}>
                        🔥 {usuario.streak_days} días
                      </span>
                    </div>
                  </div>

                  {/* Flecha */}
                  <span style={{ color: "rgba(240,240,236,0.2)", fontSize: 18 }}>›</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#0D1117",
        borderTop: "1px solid rgba(45,90,45,0.3)",
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 16px",
      }}>
        {[
          { icon: <Home size={20} />,   label: "Inicio",    ruta: "/dashboard" },
          { icon: <Zap size={20} />,    label: "Tracker",   ruta: "/tracker" },
          { icon: <Trophy size={20} />, label: "Ranking",   ruta: "/leaderboard" },
          { icon: <Users size={20} />,  label: "Comunidad", ruta: "/comunidades" },
          { icon: <User size={20} />,   label: "Perfil",    ruta: "/perfil" },
        ].map(({ icon, label, ruta }) => (
          <button key={ruta}
            onClick={() => router.push(ruta)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: "rgba(240,240,236,0.3)",
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
