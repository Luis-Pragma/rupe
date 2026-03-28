"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Home, Zap, Users, User, Search, CheckCircle } from "lucide-react";
import { unirseComunidad, salirComunidad } from "./actions";

const CATEGORIAS: Record<string, { emoji: string; color: string; bg: string }> = {
  content:  { emoji: "🎬", color: "#63B528", bg: "rgba(99,181,40,0.12)" },
  finance:  { emoji: "💰", color: "#EF9F27", bg: "rgba(239,159,39,0.12)" },
  learning: { emoji: "📚", color: "#7F77DD", bg: "rgba(127,119,221,0.12)" },
  social:   { emoji: "🤝", color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  health:   { emoji: "⚡", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
};

interface Comunidad {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  member_count: number;
  is_verified: boolean;
}

interface Props {
  comunidades: Comunidad[];
  comunidadesUnidas: string[];
  userId: string;
}

function tiempoDesde(segundos: number): string {
  if (segundos < 60) return "ahora";
  if (segundos < 3600) return `${Math.floor(segundos / 60)}m`;
  if (segundos < 86400) return `${Math.floor(segundos / 3600)}h`;
  return `${Math.floor(segundos / 86400)}d`;
}

export default function ComunidadesClient({ comunidades, comunidadesUnidas, userId }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [unidas, setUnidas] = useState<string[]>(comunidadesUnidas);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<string>("todas");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.5s ease ${ms}ms, transform 0.5s ease ${ms}ms`,
  });

  const comunidadesFiltradas = comunidades.filter(c => {
    const matchBusqueda = c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.description.toLowerCase().includes(busqueda.toLowerCase());
    const matchFiltro = filtro === "todas" || c.category === filtro ||
      (filtro === "unidas" && unidas.includes(c.id));
    return matchBusqueda && matchFiltro;
  });

  function toggleMembresia(comunidad: Comunidad) {
    const esMiembro = unidas.includes(comunidad.id);
    setUnidas(prev =>
      esMiembro ? prev.filter(id => id !== comunidad.id) : [...prev, comunidad.id]
    );
    startTransition(async () => {
      if (esMiembro) {
        await salirComunidad(comunidad.id);
      } else {
        await unirseComunidad(comunidad.id);
      }
    });
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        ...delay(0),
      }}>
        <h1 style={{
          color: "#F0F0EC", fontSize: 22, fontWeight: 700, margin: 0,
          letterSpacing: -0.5,
        }}>
          Comunidades
        </h1>
        <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 13, margin: "4px 0 0" }}>
          Conecta con personas con los mismos objetivos
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ── Búsqueda ── */}
        <div style={{ marginTop: 16, position: "relative", ...delay(100) }}>
          <Search
            size={16}
            color="rgba(240,240,236,0.3)"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Buscar comunidades..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "#0F1A0F",
              border: "1px solid rgba(45,90,45,0.3)",
              borderRadius: 12,
              padding: "10px 14px 10px 38px",
              color: "#F0F0EC",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ── Filtros ── */}
        <div style={{
          display: "flex", gap: 8, marginTop: 12, overflowX: "auto",
          paddingBottom: 4, ...delay(150),
        }}>
          {[
            { id: "todas", label: "Todas" },
            { id: "unidas", label: "Mis comunidades" },
            { id: "content", label: "🎬 Contenido" },
            { id: "finance", label: "💰 Finanzas" },
            { id: "learning", label: "📚 Aprendizaje" },
            { id: "social", label: "🤝 Social" },
            { id: "health", label: "⚡ Salud" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: filtro === f.id ? "#63B528" : "rgba(45,90,45,0.3)",
                backgroundColor: filtro === f.id ? "rgba(99,181,40,0.15)" : "transparent",
                color: filtro === f.id ? "#63B528" : "rgba(240,240,236,0.5)",
                fontSize: 12,
                fontWeight: filtro === f.id ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Lista de comunidades ── */}
        <div style={{ marginTop: 16 }}>
          {comunidadesFiltradas.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "48px 20px",
              color: "rgba(240,240,236,0.3)", fontSize: 14,
            }}>
              No hay comunidades que coincidan
            </div>
          ) : (
            comunidadesFiltradas.map((comunidad, i) => {
              const cat = CATEGORIAS[comunidad.category] ?? CATEGORIAS.content;
              const esMiembro = unidas.includes(comunidad.id);

              return (
                <div
                  key={comunidad.id}
                  style={{
                    backgroundColor: "#0F1A0F",
                    borderRadius: 16,
                    border: "1px solid rgba(45,90,45,0.25)",
                    padding: 16,
                    marginBottom: 12,
                    ...delay(200 + i * 60),
                  }}
                >
                  {/* Header de la tarjeta */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Icono */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      backgroundColor: cat.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {cat.emoji}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <h3 style={{
                          color: "#F0F0EC", fontSize: 15, fontWeight: 600, margin: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {comunidad.name}
                        </h3>
                        {comunidad.is_verified && (
                          <CheckCircle size={14} color={cat.color} style={{ flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{
                        color: "rgba(240,240,236,0.4)", fontSize: 12, margin: "3px 0 0",
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {comunidad.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: 14,
                  }}>
                    <span style={{ color: "rgba(240,240,236,0.35)", fontSize: 12 }}>
                      👥 {comunidad.member_count.toLocaleString()} miembros
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {/* Ver feed */}
                      <button
                        onClick={() => router.push(`/comunidades/${comunidad.slug}`)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: `1px solid ${cat.color}`,
                          backgroundColor: "transparent",
                          color: cat.color,
                          fontSize: 12, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Ver
                      </button>

                      {/* Unirse / Salir */}
                      <button
                        onClick={() => toggleMembresia(comunidad)}
                        disabled={isPending}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 20,
                          border: "none",
                          backgroundColor: esMiembro ? "rgba(99,181,40,0.15)" : "#63B528",
                          color: esMiembro ? "#63B528" : "#fff",
                          fontSize: 12, fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {esMiembro ? "✓ Unido" : "Unirse"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
          { icon: <Home size={22} />, label: "Inicio", ruta: "/dashboard" },
          { icon: <Zap size={22} />, label: "Tracker", ruta: "/tracker" },
          { icon: <Users size={22} />, label: "Comunidad", ruta: "/comunidades", activo: true },
          { icon: <User size={22} />, label: "Perfil", ruta: "/perfil" },
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
