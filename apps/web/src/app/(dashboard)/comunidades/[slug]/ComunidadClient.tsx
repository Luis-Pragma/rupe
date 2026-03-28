"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Zap, Users, User, Send, MessageCircle, CheckCircle } from "lucide-react";
import { crearPost, reaccionarPost, crearComentario, obtenerComentarios, unirseComunidad } from "../actions";

const CATEGORIAS: Record<string, { emoji: string; color: string; bg: string; gradiente: string }> = {
  content:  { emoji: "🎬", color: "#63B528", bg: "rgba(99,181,40,0.1)", gradiente: "linear-gradient(135deg, #1a2e0d 0%, #0D1117 60%)" },
  finance:  { emoji: "💰", color: "#EF9F27", bg: "rgba(239,159,39,0.1)", gradiente: "linear-gradient(135deg, #2e1e0d 0%, #0D1117 60%)" },
  learning: { emoji: "📚", color: "#7F77DD", bg: "rgba(127,119,221,0.1)", gradiente: "linear-gradient(135deg, #1a1930 0%, #0D1117 60%)" },
  social:   { emoji: "🤝", color: "#38BDF8", bg: "rgba(56,189,248,0.1)", gradiente: "linear-gradient(135deg, #0d1e2e 0%, #0D1117 60%)" },
  health:   { emoji: "⚡", color: "#F87171", bg: "rgba(248,113,113,0.1)", gradiente: "linear-gradient(135deg, #2e0d0d 0%, #0D1117 60%)" },
};

const REACCIONES = [
  { tipo: "like" as const, emoji: "❤️", label: "Me gusta" },
  { tipo: "fire" as const, emoji: "🔥", label: "Fuego" },
  { tipo: "clap" as const, emoji: "👏", label: "Aplaudo" },
  { tipo: "mind_blown" as const, emoji: "🤯", label: "Increíble" },
];

function tiempoDesde(fecha: string): string {
  const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (segundos < 60) return "ahora";
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)}m`;
  if (segundos < 86400) return `hace ${Math.floor(segundos / 3600)}h`;
  return `hace ${Math.floor(segundos / 86400)}d`;
}

function iniciales(nombre: string): string {
  return nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function colorNivel(nivel: number): string {
  if (nivel <= 3) return "#63B528";
  if (nivel <= 6) return "#EF9F27";
  if (nivel <= 8) return "#7F77DD";
  return "#FFD700";
}

interface Autor { id: string; username: string; full_name: string; level: number }
interface Post {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  autor: Autor | null;
}
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
  comunidad: Comunidad;
  postsIniciales: Post[];
  esMiembro: boolean;
  userId: string;
}

// ── Componente de comentarios ──────────────────────────────────────────────────
function ComentariosPanel({ postId, comunidadId, onCerrar }: {
  postId: string;
  comunidadId: string;
  onCerrar: () => void;
}) {
  const [comentarios, setComentarios] = useState<Array<{
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    autor: { username: string; level: number } | null;
  }>>([]);
  const [nuevo, setNuevo] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    obtenerComentarios(postId).then(data => {
      setComentarios(data as typeof comentarios);
      setCargando(false);
    });
  }, [postId]);

  async function enviar() {
    if (!nuevo.trim() || enviando) return;
    setEnviando(true);
    const res = await crearComentario(postId, comunidadId, nuevo);
    if (res.ok) {
      setComentarios(prev => [...prev, {
        id: Date.now().toString(),
        content: nuevo,
        created_at: new Date().toISOString(),
        user_id: "",
        autor: { username: "tú", level: 1 },
      }]);
      setNuevo("");
    }
    setEnviando(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end",
    }}
      onClick={onCerrar}
    >
      <div
        style={{
          width: "100%", maxWidth: 480, margin: "0 auto",
          backgroundColor: "#0F1A0F",
          borderRadius: "20px 20px 0 0",
          border: "1px solid rgba(45,90,45,0.3)",
          maxHeight: "70vh", display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "16px 16px 8px", borderBottom: "1px solid rgba(45,90,45,0.2)" }}>
          <p style={{ color: "#F0F0EC", fontWeight: 600, margin: 0, fontSize: 15 }}>
            Comentarios
          </p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {cargando ? (
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 13, textAlign: "center" }}>
              Cargando...
            </p>
          ) : comentarios.length === 0 ? (
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 13, textAlign: "center" }}>
              Sé el primero en comentar
            </p>
          ) : (
            comentarios.map(c => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <span style={{ color: "#63B528", fontSize: 12, fontWeight: 600 }}>
                  @{c.autor?.username ?? "usuario"}
                </span>
                <span style={{ color: "#F0F0EC", fontSize: 13, marginLeft: 8 }}>
                  {c.content}
                </span>
                <span style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, marginLeft: 8 }}>
                  {tiempoDesde(c.created_at)}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(45,90,45,0.2)",
          display: "flex", gap: 10,
        }}>
          <input
            value={nuevo}
            onChange={e => setNuevo(e.target.value)}
            onKeyDown={e => e.key === "Enter" && enviar()}
            placeholder="Escribe un comentario..."
            style={{
              flex: 1, backgroundColor: "#1a2e1a",
              border: "1px solid rgba(45,90,45,0.3)",
              borderRadius: 20, padding: "8px 14px",
              color: "#F0F0EC", fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={enviar}
            disabled={enviando}
            style={{
              backgroundColor: "#63B528", border: "none", borderRadius: "50%",
              width: 36, height: 36, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <Send size={14} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ComunidadClient({ comunidad, postsIniciales, esMiembro, userId }: Props) {
  const router = useRouter();
  const cat = CATEGORIAS[comunidad.category] ?? CATEGORIAS.content;
  const [visible, setVisible] = useState(false);
  const [posts, setPosts] = useState<Post[]>(postsIniciales);
  const [nuevoPost, setNuevoPost] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [miembro, setMiembro] = useState(esMiembro);
  const [postComentarios, setPostComentarios] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function publicar() {
    if (!nuevoPost.trim() || publicando) return;
    setPublicando(true);
    const res = await crearPost(comunidad.id, nuevoPost);
    if (res.ok) {
      const postNuevo: Post = {
        id: res.post?.id ?? Date.now().toString(),
        content: nuevoPost,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        user_id: userId,
        autor: { id: userId, username: "tú", full_name: "Tú", level: 1 },
      };
      setPosts(prev => [postNuevo, ...prev]);
      setNuevoPost("");
    }
    setPublicando(false);
  }

  function toggleReaccion(postId: string) {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: p.likes_count + 1 }
          : p
      )
    );
    startTransition(() => reaccionarPost(postId, "like"));
  }

  function handleUnirse() {
    setMiembro(true);
    startTransition(() => unirseComunidad(comunidad.id));
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: cat.gradiente,
        padding: "16px 20px 20px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => router.push("/comunidades")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,240,236,0.5)", padding: 0 }}
          >
            <ArrowLeft size={22} />
          </button>
          <div style={{
            flex: 1,
            width: 44, height: 44, borderRadius: 12,
            backgroundColor: cat.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>
            {cat.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h1 style={{ color: "#F0F0EC", fontSize: 17, fontWeight: 700, margin: 0 }}>
                {comunidad.name}
              </h1>
              {comunidad.is_verified && <CheckCircle size={14} color={cat.color} />}
            </div>
            <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 12, margin: "2px 0 0" }}>
              👥 {comunidad.member_count.toLocaleString()} miembros
            </p>
          </div>

          {!miembro && (
            <button
              onClick={handleUnirse}
              disabled={isPending}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: "none",
                backgroundColor: cat.color,
                color: "#fff",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unirse
            </button>
          )}
        </div>
        <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 13, margin: 0 }}>
          {comunidad.description}
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* ── Crear post ── */}
        <div style={{
          backgroundColor: "#0F1A0F",
          borderRadius: 16,
          border: "1px solid rgba(45,90,45,0.3)",
          padding: 14,
          marginBottom: 16,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease 0.1s",
        }}>
          <textarea
            placeholder="¿Qué estás logrando hoy? Compártelo..."
            value={nuevoPost}
            onChange={e => setNuevoPost(e.target.value)}
            rows={3}
            style={{
              width: "100%", backgroundColor: "transparent",
              border: "none", resize: "none", outline: "none",
              color: "#F0F0EC", fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <div style={{
            display: "flex", justifyContent: "flex-end", marginTop: 10,
            borderTop: "1px solid rgba(45,90,45,0.2)", paddingTop: 10,
          }}>
            <button
              onClick={publicar}
              disabled={publicando || !nuevoPost.trim()}
              style={{
                backgroundColor: nuevoPost.trim() ? cat.color : "rgba(99,181,40,0.2)",
                color: nuevoPost.trim() ? "#fff" : "rgba(240,240,236,0.3)",
                border: "none", borderRadius: 20,
                padding: "8px 20px", fontSize: 13, fontWeight: 600,
                cursor: nuevoPost.trim() ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s ease",
              }}
            >
              <Send size={13} />
              {publicando ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>

        {/* ── Posts ── */}
        {posts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 20px",
            color: "rgba(240,240,236,0.3)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{cat.emoji}</div>
            <p style={{ fontSize: 14, margin: 0 }}>Sé el primero en publicar aquí</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>
              Comparte tus avances, dudas o logros
            </p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.id}
              style={{
                backgroundColor: "#0F1A0F",
                borderRadius: 16,
                border: "1px solid rgba(45,90,45,0.2)",
                padding: 14,
                marginBottom: 12,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.4s ease ${0.1 + i * 0.05}s, transform 0.4s ease ${0.1 + i * 0.05}s`,
              }}
            >
              {/* Autor */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  backgroundColor: cat.bg,
                  border: `2px solid ${post.autor ? colorNivel(post.autor.level) : cat.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: cat.color, flexShrink: 0,
                }}>
                  {post.autor?.full_name ? iniciales(post.autor.full_name) : "?"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#F0F0EC", fontSize: 13, fontWeight: 600 }}>
                      {post.autor?.full_name ?? "Usuario"}
                    </span>
                    {post.autor && (
                      <span style={{
                        backgroundColor: colorNivel(post.autor.level),
                        color: "#0D1117",
                        fontSize: 9, fontWeight: 700,
                        padding: "1px 5px", borderRadius: 6,
                        letterSpacing: 0.5,
                      }}>
                        Nv {post.autor.level}
                      </span>
                    )}
                  </div>
                  <span style={{ color: "rgba(240,240,236,0.35)", fontSize: 11 }}>
                    @{post.autor?.username ?? "?"} · {tiempoDesde(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <p style={{
                color: "#F0F0EC", fontSize: 14, lineHeight: 1.6,
                margin: "0 0 12px", whiteSpace: "pre-wrap",
              }}>
                {post.content}
              </p>

              {/* Acciones */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                borderTop: "1px solid rgba(45,90,45,0.15)", paddingTop: 10,
              }}>
                {REACCIONES.map(r => (
                  <button
                    key={r.tipo}
                    onClick={() => toggleReaccion(post.id)}
                    style={{
                      background: "none", border: "1px solid rgba(45,90,45,0.2)",
                      borderRadius: 20, padding: "4px 10px",
                      cursor: "pointer", fontSize: 12,
                      display: "flex", alignItems: "center", gap: 4,
                      color: "rgba(240,240,236,0.5)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = cat.color;
                      e.currentTarget.style.color = cat.color;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "rgba(45,90,45,0.2)";
                      e.currentTarget.style.color = "rgba(240,240,236,0.5)";
                    }}
                  >
                    {r.emoji}
                    {r.tipo === "like" && post.likes_count > 0 && (
                      <span style={{ fontSize: 11 }}>{post.likes_count}</span>
                    )}
                  </button>
                ))}

                {/* Comentarios */}
                <button
                  onClick={() => setPostComentarios(post.id)}
                  style={{
                    background: "none", border: "1px solid rgba(45,90,45,0.2)",
                    borderRadius: 20, padding: "4px 10px",
                    cursor: "pointer", marginLeft: "auto",
                    display: "flex", alignItems: "center", gap: 5,
                    color: "rgba(240,240,236,0.4)", fontSize: 12,
                  }}
                >
                  <MessageCircle size={13} />
                  {post.comments_count > 0 ? post.comments_count : "Comentar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Panel de comentarios ── */}
      {postComentarios && (
        <ComentariosPanel
          postId={postComentarios}
          comunidadId={comunidad.id}
          onCerrar={() => setPostComentarios(null)}
        />
      )}

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
