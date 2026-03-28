# RUPE — Sistema de Avatar
**Versión:** 1.0 | **Fecha:** Marzo 2026

---

## Concepto

El avatar de RUPE es un personaje estilo Tower Defense — diseño limpio,
proporciones simples, reconocible a 32px. Refleja el nivel y progreso del
usuario. En el futuro será el personaje jugable dentro de RUPE Game.

---

## Los 3 Personajes Base

### MASCULINO
Proporciones: cabeza grande, cuerpo compacto (estilo chibi-TD)
Paleta base: tonos neutros, personalizable con prendas
Animaciones futuras: idle (respiración), celebración, correr, atacar

### FEMENINO
Proporciones: mismas que masculino (consistencia visual)
Paleta base: tonos neutros, personalizable con prendas
Animaciones futuras: idle, celebración, correr, atacar

### SIN ESPECIFICAR ★
Proporciones: mismas
Paleta base: tonos neutros con acento morado Premium
Ventaja especial: TODAS las prendas desbloqueadas desde el inicio
(Easter egg — quien elige esta opción recibe el mensaje:
"Tú no necesitas etiquetas. Solo progreso." + 100 XP bonus)

---

## Las 5 Prendas Combinables

Cada prenda tiene variantes que se desbloquean con XP, nivel o insignias.

---

### PRENDA 1 — CABEZA
*Lo que llevas arriba dice mucho de ti.*

| Prenda | Desbloqueo | Para |
|--------|-----------|------|
| Sin accesorio | Por defecto | Todos |
| Gorra básica (verde RUPE) | Por defecto | Todos |
| Gorra invertida | Nivel 2 | Todos |
| Audífonos | Insignia Contenido Brote | Todos |
| Sombrero fedora | Nivel 4 | Todos |
| Hood (sudadera con capucha up) | Nivel 3 | Todos |
| Casco TD (para el juego) | Nivel 7 | Todos |
| Corona de nivel | Nivel 10 — Ecosistema | Solo nivel 10 |
| Gorra dorada | 365 días de racha | Especial |

---

### PRENDA 2 — TORSO
*Tu uniforme de progreso.*

| Prenda | Desbloqueo | Para |
|--------|-----------|------|
| Camiseta básica blanca | Por defecto | Todos |
| Camiseta verde RUPE | Por defecto | Todos |
| Sudadera con logo | Nivel 3 | Todos |
| Camisa formal | Insignia Finanzas Brote | Todos |
| Chaleco táctico (TD) | Nivel 5 | Todos |
| Hoodie negro | Nivel 4 | Todos |
| Jersey deportivo | Insignia Salud Rama | Todos |
| Armadura TD (nivel 1) | Nivel 7 | Todos |
| Armadura TD dorada | Nivel 10 | Solo nivel 10 |

---

### PRENDA 3 — INFERIOR
*Cómodo o formal, tú decides.*

| Prenda | Desbloqueo | Para |
|--------|-----------|------|
| Jeans básicos | Por defecto | Todos |
| Shorts deportivos | Por defecto | Todos |
| Falda casual | Por defecto | Femenino / Sin especificar |
| Pantalón formal | Insignia Finanzas Brote | Todos |
| Joggers | Insignia Salud Brote | Todos |
| Cargo pants | Nivel 4 | Todos |
| Pantalón táctico TD | Nivel 6 | Todos |
| Armadura piernas TD | Nivel 8 | Todos |
| Armadura dorada TD | Nivel 10 | Solo nivel 10 |

---

### PRENDA 4 — CALZADO
*El camino que recorres lo define tu paso.*

| Prenda | Desbloqueo | Para |
|--------|-----------|------|
| Tenis blancos básicos | Por defecto | Todos |
| Tenis verdes RUPE | Por defecto | Todos |
| Botas casuales | Nivel 3 | Todos |
| Zapatos formales | Insignia Finanzas Rama | Todos |
| Tenis deportivos | Insignia Salud Brote | Todos |
| Botas tácticas TD | Nivel 5 | Todos |
| Botas de armadura TD | Nivel 8 | Todos |
| Botas doradas TD | Nivel 10 | Solo nivel 10 |

---

### PRENDA 5 — ACCESORIO
*El detalle que te hace único.*

| Prenda | Desbloqueo | Para |
|--------|-----------|------|
| Sin accesorio | Por defecto | Todos |
| Mochila básica | Por defecto | Todos |
| Lentes de sol | Nivel 2 | Todos |
| Collar simple | Nivel 2 | Todos |
| Mochila táctica | Nivel 4 | Todos |
| Escudo TD (brazo) | Nivel 6 | Todos |
| Capa (para el juego) | Nivel 7 | Todos |
| Insignia dorada visible | 50 insignias obtenidas | Especial |
| Alas TD doradas | Nivel 10 | Solo nivel 10 |

---

## Progresión Visual del Avatar por Nivel

```
Nivel 1-3   → Personaje base, ropa casual, sin armadura
Nivel 4-6   → Comienzan accesorios tácticos, más opciones
Nivel 7-8   → Elementos de armadura TD disponibles
Nivel 9-10  → Armadura completa dorada, aspecto élite
```

El avatar de nivel 10 se ve claramente distinto al de nivel 1 — reconocible a simple vista en el feed. Esto crea **aspiración visual**.

---

## Foto de Perfil — Sistema Dual

El usuario puede elegir entre dos modos:

### Modo A — Foto Real
```
→ Sube una foto desde su galería o cámara
→ Foto circular con borde del color de su nivel:
   Nivel 1-3: verde #63B528
   Nivel 4-6: ámbar #EF9F27
   Nivel 7-8: morado #7F77DD
   Nivel 9-10: dorado animado
→ Si no sube foto: iniciales del nombre con fondo de color
```

### Modo B — Avatar Personalizado
```
→ Elige su personaje (Masculino / Femenino / Sin especificar)
→ Personaliza con las prendas desbloqueadas
→ El avatar aparece en lugar de la foto en todo el sistema:
   feed, comentarios, perfil, leaderboards
→ Animación idle visible en el perfil
```

### El usuario puede cambiar entre modos cuando quiera
```
Perfil → Editar → Imagen de perfil →
  [Subir foto]  o  [Usar mi avatar]
```

---

## Especificaciones Técnicas del Avatar

```
Formato:        SVG (escalable) con JSON para animaciones (Lottie)
Tamaños:
  - Feed / comentarios:   40x40 px (circular)
  - Perfil propio:       120x120 px
  - Perfil de otro:      80x80 px
  - Leaderboard:         32x32 px
  - Vista completa TD:  256x256 px (para el juego futuro)

Fases de implementación:
  Fase 1 (MVP):    Avatar estático con selector de prendas
  Fase 2:          Animación idle (Lottie)
  Fase 3:          Animaciones de celebración al subir nivel
  Fase 4:          Integración con RUPE Game (Tower Defense PvP)
```

---

## RUPE Game — Hoja de Ruta Futura

```
FASE 1 (MVP):
  Avatar estático en perfil
  Sistema de prendas básico

FASE 2 (6 meses):
  Animaciones idle y celebración
  Stats del personaje ligados al nivel del usuario

FASE 3 (12 meses):
  Mini juego Tower Defense individual
  XP del juego suma al perfil de RUPE

FASE 4 (18 meses):
  PvP entre usuarios
  Las actividades reales dan ventajas en el juego
  Torneos dentro de comunidades
```

**La regla de oro del juego:**
> Tu personaje en RUPE Game es tan fuerte como tú eres
> consistente en la vida real. No hay atajos.
