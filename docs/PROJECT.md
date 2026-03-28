# RUPE — Documentación del Proyecto

**Versión:** 0.1.0 — MVP en desarrollo
**Fecha:** Marzo 2026
**Fundador:** Luis Pragma

---

## ¿Qué es RUPE?

**Registro Unificado de Progreso y Evolución**

Plataforma digital que combina seguimiento de progreso personal, red social con comunidades temáticas y desarrollo profesional para personas de 18-30 años construyendo su marca personal en redes sociales.

**Mercado objetivo:** México y Latinoamérica hispanohablante.

---

## Estado actual del proyecto

### ✅ Completado
- Monorepo configurado (Turborepo + pnpm workspaces)
- App web con Next.js 16 + Tailwind v4
- App móvil con Expo (estructura base)
- Base de datos en Supabase con 12 tablas
- Sistema de autenticación completo (registro, login, recuperar contraseña)
- Onboarding de 3 pasos (username, objetivo, primera actividad)
- Dashboard básico con XP, nivel y racha
- Colores y tipografía RUPE implementados

### 🔄 En progreso
- Dashboard completo con métricas reales
- Tracker de actividades

### ⏳ Pendiente
- Perfil público verificable
- Feed de comunidades
- Sistema de niveles y logros completo
- Panel financiero
- App móvil con funcionalidades completas
- Deploy en Vercel
- Análisis avanzado Premium
- Mensajes directos Premium

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend Web | Next.js + TypeScript + Tailwind CSS | 16.x |
| Frontend Móvil | React Native + Expo | SDK 52 |
| Backend / BaaS | Supabase | - |
| Base de datos | PostgreSQL (via Supabase) | 17.x |
| ORM | Drizzle ORM | 0.41 |
| Gestor de paquetes | pnpm | 10.x |
| Monorepo | Turborepo | 2.x |
| Hosting web | Vercel (pendiente deploy) | - |

---

## Identidad visual

| Color | Hex | Uso |
|-------|-----|-----|
| Verde RUPE | `#63B528` | Acciones principales, botones |
| Verde profundo | `#3B6D11` | Textos, bordes |
| Negro verde | `#1A2B1A` | Fondo modo oscuro |
| Verde claro | `#EAF3DE` | Superficies modo claro |
| Ámbar | `#EF9F27` | Logros, XP, rachas |
| Morado | `#7F77DD` | Funciones Premium |
| Blanco hueso | `#F0F0EC` | Fondo modo claro |

---

## Base de datos — Tablas actuales

| Tabla | Descripción |
|-------|-------------|
| `users` | Perfil del usuario con XP, nivel y racha |
| `profiles` | Perfil público con handle y redes sociales |
| `activities` | Tracker de actividades diarias |
| `skills` | Habilidades del usuario (0-100) |
| `communities` | Comunidades temáticas |
| `community_members` | Membresías con roles |
| `posts` | Publicaciones en comunidades |
| `comments` | Comentarios en posts |
| `reactions` | Reacciones a posts (like, fire, clap, mind_blown) |
| `messages` | Mensajes directos (solo Premium web) |
| `achievements` | Logros desbloqueados |
| `financial_health` | Panel financiero mensual |

---

## Sistema de XP y niveles

| Acción | XP |
|--------|-----|
| Registrar actividad del día | +50 |
| Publicar en comunidad | +30 |
| Completar un curso | +200 |
| Racha de 7 días | +100 |
| Obtener certificación | +500 |
| Recibir 10 reacciones | +25 |
| Completar perfil al 100% | +150 |

| Nivel | XP requerido | Nombre |
|-------|-------------|--------|
| 1 | 0 | Semilla |
| 2 | 500 | Brote |
| 3 | 1,200 | Raíz |
| 4 | 2,500 | Tallo |
| 5 | 4,500 | Hoja |
| 6 | 7,500 | Rama |
| 7 | 12,000 | Copa |
| 8 | 18,000 | Árbol |
| 9 | 27,000 | Bosque |
| 10 | 40,000 | Ecosistema |

---

## Estructura de carpetas

```
/rupe
  /apps
    /web          → Next.js (app web completa)
    /mobile       → Expo React Native (app iOS)
  /packages
    /database     → Esquema Drizzle + tipos TypeScript
    /ui           → Componentes compartidos (pendiente)
    /config       → Configuración compartida (pendiente)
  /docs           → Esta documentación
```

---

## Modelo de negocio — Freemium

### Gratis
- Perfil con tracker básico
- Comunidades (acceso, reacciones, comentarios)
- Sistema de XP y niveles
- App móvil completa (funciones básicas)

### Premium (suscripción mensual)
- Análisis avanzado con IA
- Certificaciones verificables
- Historial exportable en PDF
- Mensajes directos ilimitados
- Proyección de ingresos con IA
- Panel financiero avanzado
- Visibilidad prioritaria ante empresas
- Insignia Premium en el perfil

---

## Credenciales del proyecto

> ⚠️ Nunca compartas estas credenciales públicamente

- **Supabase:** https://supabase.com (proyecto: RUPE)
- **GitHub:** pendiente subir
- **Vercel:** pendiente deploy
- **ngrok:** para desarrollo remoto
