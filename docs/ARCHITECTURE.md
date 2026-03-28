# RUPE — Arquitectura y mapa mental

## Cómo funciona el sistema completo

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIO                              │
│              (iPhone / computadora / tablet)                │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────┐
│     APP WEB          │    │      APP MÓVIL           │
│   Next.js 16         │    │   Expo + React Native    │
│   localhost:3000     │    │   Expo Go (desarrollo)   │
│   vercel.app (prod)  │    │   App Store (futuro)     │
└──────────┬───────────┘    └────────────┬────────────┘
           │                             │
           └─────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────┐
          │         SUPABASE         │
          │  (Backend como servicio) │
          │                          │
          │  ┌────────────────────┐  │
          │  │   Auth             │  │
          │  │ (sesiones, tokens) │  │
          │  └────────────────────┘  │
          │                          │
          │  ┌────────────────────┐  │
          │  │   PostgreSQL       │  │
          │  │ (12 tablas RUPE)   │  │
          │  └────────────────────┘  │
          │                          │
          │  ┌────────────────────┐  │
          │  │   Storage          │  │
          │  │ (fotos, avatares)  │  │
          │  └────────────────────┘  │
          └──────────────────────────┘
```

---

## Flujo de un usuario nuevo

```
1. Llega a rupe.mx
       │
       ▼
2. Se registra (email + contraseña)
       │
       ▼
3. Confirma su email (link de Supabase)
       │
       ▼
4. Hace login → proxy verifica sesión
       │
       ▼
5. ONBOARDING (3 pasos)
   ├── Paso 1: Elige username y tagline → guarda en BD (users + profiles)
   ├── Paso 2: Define su objetivo principal (visual, sin BD aún)
   └── Paso 3: Primera actividad → guarda en BD (activities) → +50 XP
       │
       ▼
6. DASHBOARD
   ├── Ve su XP, nivel y racha
   ├── Ve sus actividades recientes
   └── Puede registrar más actividades
       │
       ▼
7. Regresa cada día → registra actividad → acumula XP → sube de nivel
```

---

## Cómo funciona la autenticación

```
Usuario escribe email + contraseña
       │
       ▼
Supabase verifica credenciales
       │
       ├── ❌ Error → muestra mensaje en pantalla
       │
       └── ✅ OK → crea sesión (JWT token en cookie)
                │
                ▼
          proxy.ts intercepta CADA petición
                │
                ├── Sin sesión + ruta protegida → redirige a /login
                ├── Con sesión + ruta de auth → redirige a /dashboard
                └── Normal → deja pasar
```

---

## Cómo fluye la información en el código

```
USUARIO HACE CLICK
       │
       ▼
Componente React (Client Component)
"use client" — corre en el navegador
       │
       ▼
Server Action
"use server" — corre en el servidor (seguro)
       │
       ├── Valida los datos
       ├── Verifica la sesión del usuario
       └── Escribe en Supabase con admin client
              │
              ▼
         PostgreSQL
         (datos guardados)
              │
              ▼
         Server Component
         Lee los datos y los muestra
```

---

## Mapa de rutas de la app web

```
/                           → Página de inicio (Next.js por defecto, pendiente)
/login                      → Iniciar sesión
/registro                   → Crear cuenta
/recuperar-contrasena       → Recuperar contraseña
/auth/callback              → Supabase procesa confirmación de email
/auth/signout               → Cerrar sesión
/onboarding                 → Setup inicial (solo usuarios nuevos)
/dashboard                  → Panel principal ← AQUÍ ESTAMOS
/perfil                     → Perfil del usuario (pendiente)
/comunidades                → Feed de comunidades (pendiente)
/tracker                    → Registro de actividades (pendiente)
```

---

## Estructura de archivos importantes

```
apps/web/src/
├── app/
│   ├── (auth)/             → Rutas de autenticación
│   │   ├── login/
│   │   ├── registro/
│   │   └── recuperar-contrasena/
│   ├── (onboarding)/       → Flujo de bienvenida
│   │   └── onboarding/
│   ├── (dashboard)/        → Rutas protegidas
│   │   └── dashboard/
│   └── auth/
│       ├── callback/       → Redirect de Supabase
│       └── signout/        → Cerrar sesión
├── lib/
│   ├── supabase/
│   │   ├── client.ts       → Para el navegador
│   │   ├── server.ts       → Para el servidor
│   │   └── admin.ts        → Para operaciones admin
│   └── actions/
│       └── onboarding.ts   → Guardar datos del onboarding
└── proxy.ts                → Protección de rutas

packages/database/src/
├── schema.ts               → Definición de las 12 tablas
├── types.ts                → Tipos TypeScript + XP + Niveles
└── client.ts               → Conexión a la BD
```

---

## Relaciones entre tablas

```
users (centro de todo)
  │
  ├── profiles (1 a 1) — perfil público
  ├── activities (1 a muchos) — actividades diarias
  ├── skills (1 a muchos) — habilidades
  ├── achievements (1 a muchos) — logros
  ├── financial_health (1 a muchos) — registros mensuales
  ├── messages como sender (1 a muchos)
  ├── messages como receiver (1 a muchos)
  ├── community_members (muchos a muchos con communities)
  ├── posts (1 a muchos)
  ├── comments (1 a muchos)
  └── reactions (1 a muchos)

communities
  ├── community_members (muchos usuarios)
  └── posts
        ├── comments
        └── reactions
```
