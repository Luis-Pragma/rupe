# RUPE — Setup en equipo nuevo

## Requisitos previos

Instala estos programas en orden:

### 1. Node.js
- Descarga: https://nodejs.org (versión LTS)
- Verifica: `node --version` → debe mostrar v20+

### 2. pnpm
```bash
npm install -g pnpm
```
- Verifica: `pnpm --version` → debe mostrar 10+

### 3. Git
- Descarga: https://git-scm.com/download/win
- Verifica: `git --version`

### 4. VS Code
- Descarga: https://code.visualstudio.com
- Durante instalación marca: "Add to PATH"

### 5. Expo Go (solo si vas a trabajar en la app móvil)
- Descarga en tu iPhone desde el App Store

---

## Clonar el proyecto

Una vez que el proyecto esté en GitHub (pendiente), ejecuta:

```bash
git clone https://github.com/TU_USUARIO/rupe.git
cd rupe
pnpm install
```

---

## Configurar variables de entorno

### Para la app web
Crea el archivo `apps/web/.env.local` con este contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tujpmbmcptyfbqrbihib.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.tujpmbmcptyfbqrbihib:TU_CONTRASEÑA@aws-1-us-east-1.pooler.supabase.com:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ Obtén los valores reales en: supabase.com → tu proyecto → Settings → API Keys

### Para la app móvil
Crea el archivo `apps/mobile/.env` con este contenido:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tujpmbmcptyfbqrbihib.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Levantar el proyecto

### App web (localhost:3000)
```bash
pnpm --filter web dev
```

### App móvil (Expo)
```bash
pnpm --filter mobile start
```
Luego escanea el QR con Expo Go en tu iPhone.

### Ambos al mismo tiempo
```bash
pnpm dev
```

---

## Acceder desde otro equipo en la misma red

1. Levanta el servidor con `pnpm --filter web dev`
2. Anota la IP que aparece en "Network:" (ej: `http://192.168.1.X:3000`)
3. Abre esa URL en cualquier dispositivo de la misma red WiFi

## Acceder remotamente (desde cualquier lugar)

Usa ngrok para crear un túnel público:

```bash
# Instalar ngrok (solo primera vez)
npm install -g ngrok

# Agregar tu token (solo primera vez)
ngrok config add-authtoken TU_TOKEN_DE_NGROK

# Crear túnel
ngrok http 3000
```

Crea cuenta gratuita en: https://dashboard.ngrok.com

---

## Comandos útiles

| Comando | Para qué |
|---------|----------|
| `pnpm --filter web dev` | Levantar app web |
| `pnpm --filter mobile start` | Levantar app móvil |
| `pnpm --filter @rupe/database db:push` | Sincronizar esquema con Supabase |
| `pnpm --filter @rupe/database db:studio` | Ver la BD visualmente |
| `git pull` | Obtener los últimos cambios |

---

## Solución de problemas comunes

### "Cannot find module"
```bash
pnpm install
```

### "Missing environment variable"
Verifica que el archivo `.env.local` existe y tiene todos los valores.

### Puerto 3000 ocupado
```bash
pnpm --filter web dev -- --port 3001
```
