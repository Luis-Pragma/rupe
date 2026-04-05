"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, LogOut, Shield, FileText, Lock,
  ChevronRight, Save, X, Home, Zap, Users,
  MapPin, Link, MessageSquare, Sparkles, Trophy,
} from "lucide-react";
import { cerrarSesion, actualizarPerfil } from "./actions";

interface DatosUsuario {
  id: string;
  username: string;
  full_name: string;
  email: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  tagline: string | null;
}

interface Props {
  usuario: DatosUsuario;
}

// ── Modal de confirmación ─────────────────────────────────────────────────────
function ModalConfirmar({ onConfirmar, onCancelar }: {
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 24px",
    }}>
      <div style={{
        backgroundColor: "#0F1A0F",
        borderRadius: 20,
        border: "1px solid rgba(45,90,45,0.3)",
        padding: 28,
        maxWidth: 340, width: "100%",
        textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          backgroundColor: "rgba(248,113,113,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <LogOut size={24} color="#F87171" />
        </div>
        <h3 style={{ color: "#F0F0EC", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
          ¿Cerrar sesión?
        </h3>
        <p style={{ color: "rgba(240,240,236,0.5)", fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>
          Tendrás que volver a iniciar sesión para acceder a tu cuenta.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancelar} style={{
            flex: 1, padding: "12px", borderRadius: 12,
            border: "1px solid rgba(45,90,45,0.3)",
            backgroundColor: "transparent",
            color: "rgba(240,240,236,0.6)",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button onClick={onConfirmar} style={{
            flex: 1, padding: "12px", borderRadius: 12,
            border: "none",
            backgroundColor: "rgba(248,113,113,0.15)",
            color: "#F87171",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal de política ─────────────────────────────────────────────────────────
function ModalPolitica({ titulo, contenido, onCerrar }: {
  titulo: string;
  contenido: React.ReactNode;
  onCerrar: () => void;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      backgroundColor: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "flex-end",
    }}
      onClick={onCerrar}
    >
      <div
        style={{
          width: "100%", maxWidth: 480, margin: "0 auto",
          backgroundColor: "#0D1117",
          borderRadius: "20px 20px 0 0",
          border: "1px solid rgba(45,90,45,0.3)",
          maxHeight: "85vh", display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(45,90,45,0.2)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h3 style={{ color: "#F0F0EC", fontSize: 16, fontWeight: 700, margin: 0 }}>
            {titulo}
          </h3>
          <button onClick={onCerrar} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(240,240,236,0.4)", padding: 4,
          }}>
            <X size={20} />
          </button>
        </div>
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px",
          color: "rgba(240,240,236,0.7)",
          fontSize: 13, lineHeight: 1.8,
        }}>
          {contenido}
        </div>
      </div>
    </div>
  );
}

// ── Contenido de políticas ────────────────────────────────────────────────────

const POLITICAS_RUPE = (
  <div>
    <p style={{ color: "#63B528", fontWeight: 600, marginBottom: 8 }}>Última actualización: Marzo 2026</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6 }}>1. ¿Qué es RUPE?</h4>
    <p>RUPE (Registro Unificado de Progreso y Evolución) es una plataforma de crecimiento personal que permite a los usuarios registrar actividades diarias, ganar XP y conectar con comunidades de personas con objetivos similares.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>2. Reglas de la comunidad</h4>
    <p>• Respeta a todos los miembros sin importar su nivel o categoría.<br />
    • No publiques contenido falso, engañoso o que no sea tuyo.<br />
    • Las actividades deben ser reales. El sistema detecta inconsistencias.<br />
    • No se permite spam, publicidad no autorizada ni contenido inapropiado.<br />
    • Las cuentas que violen estas reglas serán suspendidas sin previo aviso.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>3. Sistema de XP y niveles</h4>
    <p>El XP se gana registrando actividades verificables. Existe un límite diario por nivel para garantizar progreso justo. No se permite la manipulación artificial del sistema.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>4. Suspensión de cuentas</h4>
    <p>RUPE se reserva el derecho de suspender cuentas que violen estas políticas, detecten actividad fraudulenta o reciban múltiples reportes de la comunidad.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>5. Cambios a las políticas</h4>
    <p>RUPE puede actualizar estas políticas. Te notificaremos por correo con al menos 7 días de anticipación ante cambios importantes.</p>
  </div>
);

const AVISO_PRIVACIDAD = (
  <div>
    <p style={{ color: "#63B528", fontWeight: 600, marginBottom: 8 }}>Última actualización: Marzo 2026</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6 }}>1. Datos que recopilamos</h4>
    <p>• Información de cuenta: nombre, correo electrónico, nombre de usuario.<br />
    • Actividades registradas: título, categoría, descripción, XP obtenido.<br />
    • Datos de uso: frecuencia de acceso, navegación dentro de la app.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>2. Cómo usamos tus datos</h4>
    <p>• Para mostrarte tu progreso y estadísticas personales.<br />
    • Para conectarte con comunidades relevantes a tus objetivos.<br />
    • Para calcular métricas de crecimiento como rachas, XP y niveles.<br />
    • No vendemos tus datos a terceros.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>3. Perfil público</h4>
    <p>Tu perfil (@username) es visible públicamente por defecto. Incluye tu nombre, nivel, XP, racha y categorías de actividad. Puedes configurar la visibilidad desde esta sección.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>4. Seguridad</h4>
    <p>Usamos Supabase con cifrado en tránsito (HTTPS) y en reposo. Las contraseñas nunca se almacenan en texto plano.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>5. Tus derechos</h4>
    <p>Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento enviando un correo a privacidad@rupe.app</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>6. Contacto</h4>
    <p>Para cualquier duda sobre privacidad: privacidad@rupe.app</p>
  </div>
);

const TERMINOS_USO = (
  <div>
    <p style={{ color: "#63B528", fontWeight: 600, marginBottom: 8 }}>Última actualización: Marzo 2026</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6 }}>1. Aceptación</h4>
    <p>Al usar RUPE, aceptas estos términos. Si no estás de acuerdo, no uses la plataforma.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>2. Uso permitido</h4>
    <p>RUPE es para uso personal de crecimiento y desarrollo. No está permitido el uso comercial sin autorización expresa.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>3. Propiedad intelectual</h4>
    <p>El contenido que publicas en RUPE sigue siendo tuyo. Al publicarlo, nos das permiso de mostrarlo dentro de la plataforma.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>4. Limitación de responsabilidad</h4>
    <p>RUPE no garantiza resultados específicos de crecimiento personal. La plataforma es una herramienta de registro y motivación, no un servicio de coaching profesional.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>5. Edad mínima</h4>
    <p>RUPE es para mayores de 18 años. Si eres menor, necesitas consentimiento de un tutor legal.</p>

    <h4 style={{ color: "#F0F0EC", marginBottom: 6, marginTop: 16 }}>6. Jurisdicción</h4>
    <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos.</p>
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
export default function ConfiguracionClient({ usuario }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [seccion, setSeccion] = useState<"menu" | "editar">("menu");
  const [modalCerrar, setModalCerrar] = useState(false);
  const [modalPolitica, setModalPolitica] = useState<null | "politicas" | "privacidad" | "terminos">(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  // Campos del formulario
  const [fullName, setFullName] = useState(usuario.full_name ?? "");
  const [tagline, setTagline] = useState(usuario.tagline ?? "");
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [location, setLocation] = useState(usuario.location ?? "");
  const [website, setWebsite] = useState(usuario.website ?? "");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const delay = (ms: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.4s ease ${ms}ms, transform 0.4s ease ${ms}ms`,
  });

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function guardarPerfil() {
    startTransition(async () => {
      const res = await actualizarPerfil({ fullName, tagline, bio, location, website });
      if (res?.ok) {
        mostrarToast("✅ Perfil actualizado");
        setSeccion("menu");
      } else {
        mostrarToast("❌ " + (res?.error ?? "Error al guardar"));
      }
    });
  }

  const inputStyle = {
    width: "100%",
    backgroundColor: "#0F1A0F",
    border: "1px solid rgba(45,90,45,0.35)",
    borderRadius: 12,
    padding: "11px 14px",
    color: "#F0F0EC",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const labelStyle = {
    color: "rgba(240,240,236,0.5)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.5,
    marginBottom: 6,
    display: "block" as const,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", paddingBottom: 90 }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#0F1A0F", border: "1px solid rgba(99,181,40,0.4)",
          borderRadius: 12, padding: "10px 20px",
          color: "#F0F0EC", fontSize: 13, fontWeight: 600,
          zIndex: 300, whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {toast}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(45,90,45,0.3)",
        display: "flex", alignItems: "center", gap: 14,
        ...delay(0),
      }}>
        <button
          onClick={() => seccion === "editar" ? setSeccion("menu") : router.push("/perfil")}
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
            {seccion === "editar" ? "Editar perfil" : "Configuración"}
          </h1>
          {seccion === "menu" && (
            <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 12, margin: "2px 0 0" }}>
              @{usuario.username}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        {/* ═══════════════════════════════════════════════════════════ MENÚ PRINCIPAL */}
        {seccion === "menu" && (
          <>
            {/* ── Tarjeta de usuario ── */}
            <div style={{
              backgroundColor: "#0F1A0F",
              borderRadius: 16,
              border: "1px solid rgba(45,90,45,0.3)",
              padding: 16,
              marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
              ...delay(60),
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                backgroundColor: "rgba(99,181,40,0.12)",
                border: "2px solid #63B528",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, color: "#63B528",
                flexShrink: 0,
              }}>
                {usuario.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#F0F0EC", fontSize: 15, fontWeight: 600, margin: 0 }}>
                  {usuario.full_name}
                </p>
                <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 12, margin: "2px 0 0" }}>
                  {usuario.email}
                </p>
              </div>
            </div>

            {/* ── Sección: Cuenta ── */}
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: "0 0 10px 4px", ...delay(100) }}>
              CUENTA
            </p>

            <div style={{
              backgroundColor: "#0F1A0F",
              borderRadius: 16,
              border: "1px solid rgba(45,90,45,0.25)",
              overflow: "hidden",
              marginBottom: 20,
              ...delay(120),
            }}>
              {/* Editar perfil */}
              <button
                onClick={() => setSeccion("editar")}
                style={{
                  width: "100%", background: "none", border: "none",
                  padding: "15px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                  borderBottom: "1px solid rgba(45,90,45,0.15)",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: "rgba(99,181,40,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={17} color="#63B528" />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 500, margin: 0 }}>
                    Editar perfil
                  </p>
                  <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "2px 0 0" }}>
                    Nombre, tagline, bio, ubicación
                  </p>
                </div>
                <ChevronRight size={16} color="rgba(240,240,236,0.25)" />
              </button>

              {/* Racha compartida */}
              <button
                onClick={() => router.push("/racha-compartida")}
                style={{
                  width: "100%", background: "none", border: "none",
                  padding: "15px 16px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: "rgba(239,159,39,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Sparkles size={17} color="#EF9F27" />
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 500, margin: 0 }}>
                    Racha compartida
                  </p>
                  <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "2px 0 0" }}>
                    Invita a alguien a crecer contigo
                  </p>
                </div>
                <ChevronRight size={16} color="rgba(240,240,236,0.25)" />
              </button>
            </div>

            {/* ── Sección: Legal ── */}
            <p style={{ color: "rgba(240,240,236,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: "0 0 10px 4px", ...delay(180) }}>
              LEGAL
            </p>

            <div style={{
              backgroundColor: "#0F1A0F",
              borderRadius: 16,
              border: "1px solid rgba(45,90,45,0.25)",
              overflow: "hidden",
              marginBottom: 20,
              ...delay(200),
            }}>
              {[
                { icon: <Shield size={17} color="#7F77DD" />, bg: "rgba(127,119,221,0.1)", label: "Políticas de RUPE", sub: "Normas de la comunidad", key: "politicas" as const },
                { icon: <Lock size={17} color="#38BDF8" />, bg: "rgba(56,189,248,0.1)", label: "Aviso de privacidad", sub: "Cómo usamos tus datos", key: "privacidad" as const },
                { icon: <FileText size={17} color="#EF9F27" />, bg: "rgba(239,159,39,0.1)", label: "Términos de uso", sub: "Condiciones del servicio", key: "terminos" as const },
              ].map((item, i, arr) => (
                <button
                  key={item.key}
                  onClick={() => setModalPolitica(item.key)}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "15px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(45,90,45,0.15)" : "none",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: item.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <p style={{ color: "#F0F0EC", fontSize: 14, fontWeight: 500, margin: 0 }}>{item.label}</p>
                    <p style={{ color: "rgba(240,240,236,0.35)", fontSize: 11, margin: "2px 0 0" }}>{item.sub}</p>
                  </div>
                  <ChevronRight size={16} color="rgba(240,240,236,0.25)" />
                </button>
              ))}
            </div>

            {/* ── Versión ── */}
            <p style={{
              textAlign: "center", color: "rgba(240,240,236,0.2)",
              fontSize: 11, margin: "0 0 16px",
              ...delay(240),
            }}>
              RUPE v1.0.0 — Beta
            </p>

            {/* ── Cerrar sesión ── */}
            <button
              onClick={() => setModalCerrar(true)}
              style={{
                width: "100%",
                backgroundColor: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 14,
                padding: "14px",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                color: "#F87171",
                fontSize: 14, fontWeight: 600,
                transition: "all 0.2s ease",
                ...delay(280),
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.15)";
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "rgba(248,113,113,0.08)";
                e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)";
              }}
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════ EDITAR PERFIL */}
        {seccion === "editar" && (
          <div style={{ ...delay(0) }}>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Nombre completo */}
              <div>
                <label style={labelStyle}>
                  <User size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  NOMBRE COMPLETO
                </label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  style={inputStyle}
                />
              </div>

              {/* Tagline */}
              <div>
                <label style={labelStyle}>
                  <Sparkles size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  TAGLINE
                </label>
                <input
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Frase corta que te describe..."
                  maxLength={80}
                  style={inputStyle}
                />
                <p style={{ color: "rgba(240,240,236,0.25)", fontSize: 11, margin: "5px 0 0", textAlign: "right" }}>
                  {tagline.length}/80
                </p>
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>
                  <MessageSquare size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  BIO
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti y tus objetivos..."
                  rows={3}
                  maxLength={200}
                  style={{ ...inputStyle, resize: "none" as const }}
                />
                <p style={{ color: "rgba(240,240,236,0.25)", fontSize: 11, margin: "5px 0 0", textAlign: "right" }}>
                  {bio.length}/200
                </p>
              </div>

              {/* Ubicación */}
              <div>
                <label style={labelStyle}>
                  <MapPin size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  UBICACIÓN
                </label>
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Ciudad, País"
                  style={inputStyle}
                />
              </div>

              {/* Website */}
              <div>
                <label style={labelStyle}>
                  <Link size={11} style={{ marginRight: 5, verticalAlign: "middle" }} />
                  SITIO WEB
                </label>
                <input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://tu-sitio.com"
                  type="url"
                  style={inputStyle}
                />
              </div>

              {/* Username — solo lectura */}
              <div style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(45,90,45,0.15)",
                borderRadius: 12, padding: "11px 14px",
              }}>
                <p style={{ color: "rgba(240,240,236,0.25)", fontSize: 11, margin: "0 0 2px", fontWeight: 600 }}>
                  USERNAME (no editable)
                </p>
                <p style={{ color: "rgba(240,240,236,0.4)", fontSize: 14, margin: 0 }}>
                  @{usuario.username}
                </p>
              </div>

              {/* Botón guardar */}
              <button
                onClick={guardarPerfil}
                disabled={isPending || !fullName.trim()}
                style={{
                  width: "100%",
                  backgroundColor: fullName.trim() ? "#63B528" : "rgba(99,181,40,0.2)",
                  border: "none", borderRadius: 14,
                  padding: "14px",
                  color: fullName.trim() ? "#fff" : "rgba(240,240,236,0.3)",
                  fontSize: 15, fontWeight: 700,
                  cursor: fullName.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.2s ease",
                  marginTop: 4,
                }}
              >
                <Save size={16} />
                {isPending ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
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
          { icon: <Home size={20} />,   label: "Inicio",    ruta: "/dashboard" },
          { icon: <Zap size={20} />,    label: "Tracker",   ruta: "/tracker" },
          { icon: <Trophy size={20} />, label: "Ranking",   ruta: "/leaderboard" },
          { icon: <Users size={20} />,  label: "Comunidad", ruta: "/comunidades" },
          { icon: <User size={20} />,   label: "Perfil",    ruta: "/perfil", activo: true },
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

      {/* ── Modales ── */}
      {modalCerrar && (
        <ModalConfirmar
          onConfirmar={() => { startTransition(() => cerrarSesion()); }}
          onCancelar={() => setModalCerrar(false)}
        />
      )}

      {modalPolitica === "politicas" && (
        <ModalPolitica titulo="Políticas de RUPE" contenido={POLITICAS_RUPE} onCerrar={() => setModalPolitica(null)} />
      )}
      {modalPolitica === "privacidad" && (
        <ModalPolitica titulo="Aviso de Privacidad" contenido={AVISO_PRIVACIDAD} onCerrar={() => setModalPolitica(null)} />
      )}
      {modalPolitica === "terminos" && (
        <ModalPolitica titulo="Términos de Uso" contenido={TERMINOS_USO} onCerrar={() => setModalPolitica(null)} />
      )}
    </div>
  );
}
