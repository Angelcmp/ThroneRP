# ThroneRP — Diseno de Frontend

> Documento vivo de diseno. Define la identidad visual, wireframes y arquitectura del frontend React/Next.js antes de escribir codigo.

---

## 1. Identidad visual

### Paleta de colores — "Trono y Pergamino"

| Token              | Hex       | Uso                                        |
| ------------------ | --------- | ------------------------------------------ |
| `--bg-deep`        | `#0b0e14` | Fondo principal (body, sidebar)            |
| `--bg-panel`       | `#151820` | Tarjetas, modales, paneles                 |
| `--bg-elevated`    | `#1c2030` | Hover states, dropdowns, tooltips          |
| `--gold`           | `#c9a96e` | Acentos, botones primarios, iconos activos |
| `--gold-hover`     | `#ddbc80` | Hover de botones gold                      |
| `--text-primary`   | `#e8e0d5` | Texto principal                            |
| `--text-secondary` | `#8e8370` | Labels, descripciones, placeholders        |
| `--text-muted`     | `#5c5545` | Texto deshabilitado, metadata              |
| `--border`         | `#2a2d38` | Bordes sutiles, separadores                |
| `--hp-red`         | `#c0392b` | HP, dano, peligro, errores                 |
| `--mana-blue`      | `#4a90d9` | Mana, magia, info                          |
| `--success`        | `#27ae60` | Exito, curacion                            |
| `--warning`        | `#f0a040` | Advertencias, condiciones                  |

### Tipografia

| Rol                       | Fuente             | Fallback              | Peso          |
| ------------------------- | ------------------ | --------------------- | ------------- |
| Headings (h1-h4)          | **Cinzel**         | Georgia, serif        | 400, 600, 700 |
| Body / narracion          | **Lora**           | Georgia, serif        | 400, 500      |
| UI / forms / labels       | **Inter**          | system-ui, sans-serif | 400, 500, 600 |
| Codigo / comandos / dados | **JetBrains Mono** | monospace             | 400           |

Google Fonts import: `Cinzel:wght@400;600;700`, `Lora:ital,wght@0,400;0,500;1,400`, `Inter:wght@400;500;600`, `JetBrains+Mono:wght@400`

### Breakpoints

| Nombre | Min-width | Destino                       |
| ------ | --------- | ----------------------------- |
| `sm`   | 640px     | Movil                         |
| `md`   | 768px     | Tablet                        |
| `lg`   | 1024px    | Desktop                       |
| `xl`   | 1280px    | Pantalla grande (game screen) |

---

## 2. Wireframes

### 2.1 Landing Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│  [logo]  ThroneRP       [Docs] [Demo] [Sign In] [Start] │
├─────────────────────────────────────────────────────┤
│                                                     │
│          TUS HISTORIAS COBRAN VIDA                  │
│     Roleplay narrativo con un Narrador IA           │
│     que recuerda cada decision que tomas             │
│                                                     │
│        [   Crear cuenta gratis   ]                  │
│        [   Ver demo →            ]                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Crear personaje]  [Generar mundos]  [Jugar]      │
│  ┌────────────────┬─────────────────┬────────────┐  │
│  │   Constructor   │   Mundos vivos   │  Memoria   │  │
│  │  manual o IA    │ facciones, lore │ persistente│  │
│  └────────────────┴─────────────────┴────────────┘  │
│  ┌────────────────┬─────────────────┬────────────┐  │
│  │   Multi-jugador │ Streaming real  │ Comandos   │  │
│  │ GM + party      │ time del narra  │ /roll /look│  │
│  └────────────────┴─────────────────┴────────────┘  │
├─────────────────────────────────────────────────────┤
│  Footer: links, copyright                           │
└─────────────────────────────────────────────────────┘
```

### 2.2 Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────┐
│  [logo]  [Campanas] [Personajes] [Mundos]   [user]  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │  Tus campanas                            │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ • Campa  │  │Campana 1  │ │Campana 2  │ │ + Nueva  │  │
│ • Chars  │  │5 jugadores│ │3 turnos   │ │ campana  │  │
│ • Mundos │  └──────────┘ └──────────┘ └──────────┘  │
│          │                                          │
│ • Invita │  Personajes recientes                    │
│          │  [char1] [char2] [char3] [+ Nuevo]       │
│          │                                          │
│          │  Mundos recientes                        │
│          │  [mundo1] [mundo2] [+ Nuevo]             │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 2.3 Character Builder (`/characters/new`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                    Crear personaje          │
├─────────────────────────────────────────────────────┤
│  Paso 1/4: Identidad                                │
│                                                     │
│  ┌─────────────┐  Nombre: [_______________]         │
│  │  [avatar]   │  Raza:   [Humano       ▼]          │
│  │  placeholder│  Clase:  [Guerrero     ▼]          │
│  └─────────────┘  Nivel:  [1]                       │
│                                                     │
│  Apariencia:   [_____________________________]       │
│                [_____________________________]       │
│                                                     │
│  [◄ Atras]                     [Siguiente: Stats ►]  │
├─────────────────────────────────────────────────────┤
│  -- o genera con IA --                              │
│  Describe tu personaje: [___________________]        │
│  [  Generar con IA ✨  ]                             │
└─────────────────────────────────────────────────────┘
```

### 2.4 Game Screen (`/play/[campaignId]`)

```
┌──────────────────────────────────────────────────────┐
│ ← Campaign Title       🟢 Ronda 3    [GM Panel] [⚙]  │
├────┬────────────────────────────┬────────────────────┤
│    │                            │  ⚔️ Thalion       │
│ S  │  ┌──────────────────────┐ │  HP ████████░░ 8/10│
│ I  │  │ *El bosque susurra*  │ │  Mana ████░░░░ 4/10│
│ D  │  │ mientras avanzan...  │ │  STR 14  DEX 16    │
│ E  │  │                      │ │  CON 12  INT 10    │
│ B  │  │ Las antorchas revelan│ │  WIS 14  CHA 12    │
│ A  │  │ una entrada oculta...│ │                     │
│ R  │  │                      │ │  [Inventario]       │
│    │  │ "¿Que hacen?"        │ │  Espada larga ⚔️     │
│    │  └──────────────────────┘ │  Antorcha 🔥        │
│    │                            │  Pocion curativa ❤️ │
│    │  ┌──────────────────────┐ │                     │
│    │  │ /roll d20 → 14+2=16 │ │  [Chat]             │
│ C  │  │ /look → Bosque Oscuro│ │  Alice: cuidado!    │
│ O  │  │ /inventory → 3 items │ │  Bob: yo voy primero│
│ M  │  └──────────────────────┘ │                     │
│ M  │                            │                     │
│ A  │  ┌──────────────────────┐ │                     │
│ N  │  │[Avanzar hacia la    ]│ │                     │
│ D  │  │ entrada oculta...    │ │  [Estado del juego] │
│ S  │  │                      │ │  Lugar: Bosque      │
│    │  │         [Enviar ►]   │ │  Hora: Noche        │
│    │  │  /roll /check /look   │ │  Quest: Encuentra  │
│    │  └──────────────────────┘ │  el santuario       │
│    │                            │                     │
│    │  Ronda: [Enviar accion]  │                     │
│    │  [Esperando a Bob...]    │                     │
└────┴────────────────────────────┴────────────────────┘
```

### 2.5 World Builder (`/worlds/new`)

```
┌─────────────────────────────────────────────────────┐
│  ← Back                     Crear mundo             │
├─────────────────────────────────────────────────────┤
│  Nombre: [___________________]                      │
│  Genero: [Fantasia ▼]  Tono: [Epico ▼]             │
│                                                     │
│  Premisa: [___________________________________]      │
│           [___________________________________]      │
│                                                     │
│  ┌── Facciones ──────┐  ┌── Lugares ───────────┐   │
│  │ El Consejo Arcano  │  │ Bosque Susurrante     │   │
│  │ La Guardia de Acero│  │ Ciudadela de Piedra    │   │
│  │ [+ Anadir]         │  │ [+ Anadir]            │   │
│  └────────────────────┘  └───────────────────────┘   │
│                                                     │
│  Magia: [___________________]                        │
│  Tecnologia: [___________________]                   │
│  Conflicto: [___________________]                    │
│                                                     │
│  [   Generar con IA ✨  ]   [   Guardar   ]          │
├─────────────────────────────────────────────────────┤
│  Plantillas: [Fantasia Epica] [Cyberpunk]           │
│               [Lovecraftiano] [Space Opera] ...      │
└─────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura tecnica (Next.js)

### Stack

| Capa          | Tecnologia                   | Justificacion                                      |
| ------------- | ---------------------------- | -------------------------------------------------- |
| Framework     | Next.js 14 (App Router)      | SSR para SEO, RSC para datos, rutas file-based     |
| Estilos       | Tailwind CSS 3               | Utilidades, tema custom via CSS variables          |
| Estado        | Zustand                      | Mas ligero que Redux, API simple                   |
| Fetching      | TanStack Query (React Query) | Cacheo, revalidacion, loading/error states         |
| Auth          | Better-Auth client           | Ya integrado en backend, cookies automaticas       |
| Streaming     | EventSource (SSE)            | Nativo del navegador, sin WebSocket para narracion |
| Chat          | WebSocket nativo (ws://)     | `@fastify/websocket` en backend                    |
| Forms         | React Hook Form + Zod        | Validacion consistente con backend                 |
| UI Components | shadcn/ui + Radix            | Accesible, personalizable, dark theme nativo       |

### Estructura de directorios

```
frontend/
├── public/
│   └── assets/             # iconos, logos, og-image
├── src/
│   ├── app/                # App Router (Next.js 14)
│   │   ├── layout.js       # Root layout con providers
│   │   ├── page.js         # Landing page
│   │   ├── dashboard/
│   │   │   └── page.js     # Dashboard principal
│   │   ├── characters/
│   │   │   ├── page.js     # Lista de personajes
│   │   │   ├── [id]/
│   │   │   │   └── page.js # Detalle/editar personaje
│   │   │   └── new/
│   │   │       └── page.js # Constructor de personaje
│   │   ├── worlds/
│   │   │   ├── page.js     # Lista de mundos
│   │   │   ├── [id]/
│   │   │   │   └── page.js # Detalle/editar mundo
│   │   │   └── new/
│   │   │       └── page.js # Builder de mundo
│   │   ├── play/
│   │   │   └── [id]/
│   │   │       └── page.js # Pantalla de juego
│   │   └── auth/
│   │       ├── login/
│   │       └── signup/
│   ├── components/
│   │   ├── ui/             # Primitivos: Button, Input, Card, Dialog, etc
│   │   ├── layout/         # Shell, Sidebar, Header, Footer
│   │   ├── characters/     # CharacterCard, StatsEditor, InventoryGrid
│   │   ├── worlds/         # WorldCard, FactionList, LocationMap
│   │   ├── game/           # ChatPanel, CharacterSheet, CommandBar, DiceRoller
│   │   └── auth/           # LoginForm, SignupForm, OAuthButtons
│   ├── lib/
│   │   ├── api.js          # Cliente HTTP (fetch wrapper con auth)
│   │   ├── auth-client.js  # Better-Auth client config
│   │   ├── sse.js          # EventSource wrapper para streaming
│   │   └── websocket.js    # Chat WebSocket client
│   ├── stores/
│   │   ├── auth.store.js   # Sesion, usuario actual
│   │   ├── game.store.js   # Campania activa, turnos, streaming state
│   │   └── ui.store.js     # Sidebar state, theme prefs
│   └── hooks/
│       ├── useCampaign.js
│       ├── useCharacter.js
│       ├── useNarration.js # Maneja streaming SSE del turno
│       └── useChat.js      # Maneja cone xion WebSocket
├── tailwind.config.js
├── next.config.js
└── package.json
```

### Rutas (App Router)

| Ruta               | Descripcion                 | Auth |
| ------------------ | --------------------------- | ---- |
| `/`                | Landing page publica        | No   |
| `/dashboard`       | Dashboard post-login        | Si   |
| `/characters`      | Lista de personajes         | Si   |
| `/characters/new`  | Constructor de personaje    | Si   |
| `/characters/[id]` | Ficha / editar personaje    | Si   |
| `/worlds`          | Lista de mundos             | Si   |
| `/worlds/new`      | Builder de mundo            | Si   |
| `/worlds/[id]`     | Detalle / editar mundo      | Si   |
| `/play/[id]`       | Pantalla de juego (campana) | Si   |
| `/auth/login`      | Login                       | No   |
| `/auth/signup`     | Registro                    | No   |

### Flujo de datos principal

```
Pantalla de juego:
  Usuario escribe input → POST /api/campaigns/:id/turns/stream (SSE)
    → EventSource recibe chunks de texto
    → Se renderiza incrementalmente en ChatPanel
    → Al terminar, se actualiza sidebar (HP, estado, memorias)

  Comandos: input empieza con "/" → se parsea localmente
    → /roll, /check van al backend via POST /campaigns/:id/commands
    → /look, /inventory, /stats, /character se resuelven local con estado

  Chat: WebSocket a /api/campaigns/:id/chat
    → Enviar/recibir mensajes en tiempo real
    → Storage local + historial via GET

  Rondas multi-jugador:
    → GM: POST /rounds/start
    → Jugador: POST /rounds/submit
    → GM: POST /rounds/resolve/stream (SSE)
    → UI muestra quien ha enviado / quien falta
```

### Estados de UI por componente

| Componente       | Loading                                    | Empty                                                | Error                                 | Success                     |
| ---------------- | ------------------------------------------ | ---------------------------------------------------- | ------------------------------------- | --------------------------- |
| CampaignList     | 3 skeletons                                | "No tienes campanas. Crea tu primera aventura" → CTA | Toast + retry                         | Cards grid                  |
| CharacterBuilder | Spinner en "Generar con IA"                | Formulario vacio con placeholders                    | Mensaje en el paso fallido            | Redirect a /characters/[id] |
| GameScreen       | "El narrador prepara la escena..." shimmer | Input vacio: "Que haces?" placeholder                | "El narrador no responde. Reintenta." | Streaming text              |
| WorldBuilder     | Spinner en generacion IA                   | Form vacio con plantillas sugeridas                  | Error toast                           | Preview + redirect          |

### Performance considerations

- **Streaming SSR**: la landing page usa RSC para SEO, el dashboard y game screen son client-side (sin SEO necesario).
- **Code splitting**: `@/components/game/` se carga lazy, es el bundle mas pesado (chat + streaming + comandos).
- **SSE**: usar `EventSource` nativo con reconexion automatica (3 intentos, exponential backoff).
- **WebSocket**: unica conexion por campana abierta. Reconectar en `onclose` con backoff.
- **TanStack Query**: `staleTime: 30s` para listas (characters, worlds, campaigns), `staleTime: 0` para game state.

### Convenciones de codigo frontend

- Componentes server (`"use server"`) solo para fetches iniciales que requieran SEO.
- Componentes cliente (`"use client"`) para todo lo interactivo.
- Tailwind con `cn()` utility (clsx + tailwind-merge).
- Zustand stores separadas por dominio, sin mezclar con fetching.
- Llamadas API centralizadas en `src/lib/api.js` (NO usar `fetch` suelto en componentes).
- Tipos Typescript compartidos para respuestas del backend (generados o manuales).
- Formularios con React Hook Form + validacion Zod (mismos schemas que el backend donde sea posible).
