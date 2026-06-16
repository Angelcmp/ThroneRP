# Changelog

All notable changes to ThroneRP are documented in this file.

---

## [0.3.0] - 2026-06-05

### Added

#### Fase 5: Multi-jugador (completa)

- **Modelo de jugadores en Campaign**: nuevo array `players[]` con `{ userId, characterId, role, joinedAt }`.
  - Roles: `gm` (Game Master), `player`, `spectator`.
  - El creador de la campana es automaticamente GM.
  - Metodos de instancia: `getPlayer()`, `isGM()`, `isPlayer()`.
- **Modelo Invitation**: `{ campaignId, inviterUserId, inviteeUserId, token, status, expiresAt }`.
  - Token unico con expiracion de 7 dias.
  - Estados: `pending`, `accepted`, `declined`, `expired`.
- **Modelo PlayerNote**: `{ campaignId, authorUserId, title, content, visibility }`.
  - Visibilidad: `gm` (solo GM) o `all` (todos los jugadores).
- **Utilidades de autorizacion** (`src/utils/campaign-auth.js`):
  - `getPlayerRole()`, `isInCampaign()`, `isGM()`, `isPlayer()`, `canView()`, `canPlay()`, `canManage()`.
  - Loaders con check de rol: `loadCampaignAs()`, `loadCampaignAsGM()`, `loadCampaignAsPlayer()`.
  - `listPlayableCampaigns()`: campanas donde el usuario es GM o player.
- **Sistema de invitaciones**:
  - `POST /api/campaigns/:id/invite` — GM envia invitacion a otro usuario.
  - `GET /api/invitations` — listar invitaciones pendientes del usuario.
  - `POST /api/invitations/:token/accept` — aceptar invitacion (con `characterId`).
  - `POST /api/invitations/:token/decline` — rechazar invitacion.
- **Gestion de jugadores en campana**:
  - `GET /api/campaigns/:id/players` — listar GM, jugadores y sus personajes.
  - `PATCH /api/campaigns/:id/players/:userId` — cambiar rol (GM only).
  - `DELETE /api/campaigns/:id/players/:userId` — remover jugador (GM only).
- **Notas compartidas**:
  - `POST /api/campaigns/:id/notes` — crear nota.
  - `GET /api/campaigns/:id/notes` — listar notas visibles.
  - `PATCH /api/campaigns/:id/notes/:noteId` — editar nota (autor o GM).
  - `DELETE /api/campaigns/:id/notes/:noteId` — eliminar nota (autor o GM).
- **Message model**: nuevo campo `playerUserId` para tracking de que jugador envio cada mensaje.
- **Sistema de rondas multi-jugador**:
  - `POST /api/campaigns/:id/rounds/start` — GM abre una ronda para que los jugadores declaren sus acciones.
  - `POST /api/campaigns/:id/rounds/submit` — jugador envia su accion a la ronda actual.
  - `GET /api/campaigns/:id/rounds/current` — ver estado de la ronda (quien envio, quien falta).
  - `POST /api/campaigns/:id/rounds/cancel` — GM cancela la ronda actual.
  - `POST /api/campaigns/:id/rounds/resolve` — GM resuelve la ronda: el narrador IA procesa todas las acciones juntas.
  - `POST /api/campaigns/:id/rounds/resolve/stream` — resolucion de ronda en streaming SSE.
  - `POST /api/campaigns/:id/gm-narrate` — GM narra un evento sin esperar acciones de jugadores.
- **Chat en tiempo real con WebSocket**:
  - `@fastify/websocket` — `GET /api/campaigns/:id/chat` (upgrade WebSocket).
  - Broadcast de mensajes entre todos los jugadores conectados a la campana.
  - Mensajes almacenados en `Message` con `role: "chat"`.
  - Eventos de conexion/desconexion con mensajes de sistema.
  - `GET /api/campaigns/:id/chat/history` — historial de chat de la campana.
- **Nuevos prompts**: `SYSTEM_NARRATOR_ROUND` para resolucion de rondas multi-jugador, `SYSTEM_GM_NARRATION` para narracion directa del GM.
- **Modelo Campaign**: nuevo subdocumento `round` con `number`, `status` (`idle`/`open`/`resolving`) y `submissions[]`.
  - Metodos: `getActivePlayers()`, `hasSubmitted()`, `allSubmitted()`.
- **Seed script**: `scripts/seed-models.js` — crea usuario demo, mundo, personaje y campana via API REST.
- **Fallback MongoDB en memoria**: `database.js` usa `mongodb-memory-server` si no hay MongoDB disponible.

### Changed

- **Refactor de autorizacion**: todas las rutas y servicios de campaña ahora usan `campaign-auth.js` en lugar de `campaign.userId !== userId`.
- `listCampaigns()` ahora devuelve campanas donde el usuario es GM o jugador (no solo owner).
- `narrateTurn()` y `narrateTurnStream()` cargan el personaje del jugador activo via `getPlayerCharacter()`.
- `export.service.js` usa `loadCampaignAsPlayer()` para verificar acceso.
- Mensajes ahora incluyen `playerUserId` para identificar que jugador escribio.
- `auth.plugin.js` envuelto con `fastify-plugin` para exponer decoradores a todas las rutas.

### Fixed

- `auth.plugin.js` faltaba `fastify-plugin` — decorados no visibles en plugins hermanos.
- `database.js` — agregado `mongoose.disconnect()` antes de reconectar a MongoDB en memoria.

---

### Frontend — Next.js 16 (React 19, Tailwind 4, TypeScript)

`frontend/` — SPA completa con tema oscuro RPG.

#### Estructura y configuracion

- **Scaffold**: Next.js 16.2.7 con App Router, `@tailwindcss/postcss`, Tailwind v4.
- **Tema RPG oscuro**: paleta "Trono y Pergamino" (`#0b0e14` fondo, `#c9a96e` acento dorado).
- **Tipografias**: Cinzel (headings), Lora (narracion), Inter (UI), JetBrains Mono (codigo/comandos).
- **Componentes UI**: Button, Input, Card, Badge, Spinner — todos con variantes y tema oscuro.
- **Loading/Empty/Error states**: skeleton shimmer, estados vacios con CTA, manejo de errores en formularios.

#### Rutas publicas

- `GET /` — Landing page con hero, features grid (6 cards: Constructor, Mundos, Memoria, Multi-jugador, Streaming, Comandos), CTA a registro.
- `GET /auth/login` — Login con form email/password.
- `GET /auth/signup` — Registro con nombre/email/password.

#### Rutas protegidas (con layout Shell)

- `GET /dashboard` — Dashboard: campanas activas, personajes recientes, mundos recientes. Cada seccion con cards + boton "Nuevo".
- `GET /characters` — Lista de personajes con HP bar, nombre, raza, clase, nivel.
- `GET /characters/new` — Constructor multi-paso: 1) Identidad (nombre, raza, clase), 2) Stats (distribuir 75 pts), 3) Apariencia, 4) Backstory + generador IA.
- `GET /worlds` — Lista de mundos con facciones, lugares, genero, tono.
- `GET /worlds/new` — Builder de mundo: nombre, genero, tono, premisa, magia, tecnologia + generador IA.
- `GET /play/[id]` — Pantalla de juego completa:
  - Panel central: historial de mensajes estilo chat, narrador IA con streaming simulado, cursor parpadeante dorado.
  - Sidebar izquierda: ficha del personaje (HP bar, mana bar, stats grid 3x3, inventario completo).
  - Sidebar derecha: estado del mundo (lugar, hora, fecha, mision, ambiente), party con indicadores online/offline, estado de ronda actual.
  - Comandos rapidos: `/roll d20`, `/look`, `/inventory`, `/stats`, `/check DEX`.
  - Input con boton de envio, estados disabled durante streaming.

#### Librerias frontend

| Paquete                   | Proposito                  |
| ------------------------- | -------------------------- |
| `zustand`                 | Estado global (auth store) |
| `@tanstack/react-query`   | Cacheo y fetching          |
| `react-hook-form`         | Formularios                |
| `clsx` + `tailwind-merge` | Clases condicionales       |

#### Documentacion de diseno

- `DESIGN.md`: paleta de 11 colores, tipografia (4 fuentes), breakpoints responsive, 5 wireframes ASCII, arquitectura Next.js, flujo de datos, tabla de estados UI, estructura de directorios.

---

## [0.2.0] - 2026-06-04

### Added

#### Fase 2: Estabilidad y DX

- **Vitest**: framework de testing con 57 tests (unitarios + integracion).
- **GitHub Actions CI**: workflow con lint, test y cobertura en Node 20/22.
- **Zod en rutas**: schemas de validacion para character, world, campaign (create, update, generate).
- **Middleware `validateBody()`**: preHandler que parsea y valida request.body contra Zod.
- **Rate limiting granular**: auth 20/min, generacion IA 5/min, turnos 10/min, CRUD 200/min.
- **Healthcheck real**: verifica mongoose connection + proveedores IA configurados.
- **Logger mejorado**: redaccion de headers sensibles en produccion, genReqId trazable.
- **Dockerfile**: Node 22-alpine, multi-stage para desarrollo reproducible.
- **Scripts nuevos**: `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run typecheck`.

#### Fase 3: Experiencia de juego

- **Sistema de dados**: `roll()` soporta d20, XdN, XdN+mod, XdNkhY, d%; `rollCheck()` para ability checks.
- **Comandos de jugador**: `/roll`, `/check`, `/look`, `/inventory`, `/stats`, `/character`.
- **Streaming SSE**: `POST /api/campaigns/:id/turns/stream` con chunks en tiempo real.
  - Soporta `reasoning_content` de modelos DeepSeek R1, o3-mini.
  - Emite eventos `meta`, `reasoning`, `chunk`, `done`, `command_result`.
- **Escena inicial con IA**: `generateOpening: true` en creacion de campana.
- **Estado de personaje dinamico**: mana, conditions[], temporaryEffects[] en modelo Character.
- **Equipamiento con stats**: inventory items con campo `stats` (Map) que modifica atributos al equipar.
- **Plantillas de generacion**: 7 templates (Fantasia epica, Cyberpunk, Lovecraftiano, etc.).
- **Editor de mundo visual**: endpoints `POST /api/worlds/:id/factions/generate` y `/locations/generate`.
- **Chunking inteligente**: `smartChunk()` recorta mensajes antiguos segun ventana de contexto.
- **Modelos de razonamiento**: `reasoningContent` capturado en respuestas normales y streaming.

#### Fase 4: Memoria avanzada

- **Reranking de memorias**: score combinado (vectorSim × 0.45 + importance × 0.35 + recency × 0.2).
- **Deteccion de contradicciones**: el extractor de memorias recibe contexto de memorias previas y marca `contradicts_previous`.
- **Memoria jerarquica**: `ChapterSchema` anidado en Campaign con startTurn, endTurn, title, summary, status.
- **Auto-titulado de capitulos**: IA genera titulos dramaticos al cerrar capitulo (~15 turnos).
- **Exportacion**: `GET /api/campaigns/:id/export/{json|markdown|html}`.
  - JSON: datos completos (campaign, world, character, messages, memories, timeline).
  - Markdown: cronica formateada con capitulos y memorias.
  - HTML: documento imprimible con CSS para PDF.
- **Timeline**: `GET /api/campaigns/:id/timeline` con eventos ordenados por turno.

#### Nuevos endpoints

| Metodo | Ruta                                 | Descripcion                                   |
| ------ | ------------------------------------ | --------------------------------------------- |
| `GET`  | `/api/templates`                     | Listar plantillas de generacion               |
| `GET`  | `/api/commands`                      | Listar comandos de jugador disponibles        |
| `POST` | `/api/campaigns/:id/turns/stream`    | Enviar accion → narracion IA en streaming SSE |
| `POST` | `/api/campaigns/:id/commands`        | Ejecutar comando sin turno de narracion       |
| `GET`  | `/api/campaigns/:id/timeline`        | Timeline de eventos de la campania            |
| `GET`  | `/api/campaigns/:id/chapters`        | Listar capitulos de la campania               |
| `GET`  | `/api/campaigns/:id/export/json`     | Exportar campania como JSON                   |
| `GET`  | `/api/campaigns/:id/export/markdown` | Exportar campania como Markdown               |
| `GET`  | `/api/campaigns/:id/export/html`     | Exportar campania como HTML                   |
| `POST` | `/api/worlds/:id/factions/generate`  | Generar faccion con IA                        |
| `POST` | `/api/worlds/:id/locations/generate` | Generar ubicacion con IA                      |

#### Modelos actualizados

- **Character**: +mana, +conditions[], +temporaryEffects[], +stats en inventory items.
- **Campaign**: +chapters[] con ChapterSchema (title, summary, startTurn, endTurn, status).
- **Memory**: +contradicts, +contradictions[], +score, +chapter.

### Added

#### Servidor

- Servidor Fastify 4 con soporte ESM puro (`"type": "module"`).
- Plugins: CORS, Helmet, rate-limiting (200 req/min), error handler global.
- Healthcheck endpoint (`GET /health`).

#### Autenticacion (Better-Auth)

- Registro y login con email/password.
- OAuth opcional con Google y Discord.
- Sesiones cifradas con expiracion configurable (30 dias).
- Plugin Fastify `requireAuth` para rutas protegidas.
- Proxy completo de endpoints de Better-Auth (`/api/auth/*`).

#### Capa de IA multi-proveedor

- Cliente unificado basado en OpenAI SDK con soporte para cualquier `baseURL`.
- 6 proveedores soportados:
  - **DeepSeek** (V3, R1) — exc elec ca lidad/precio.
  - **Qwen** (Max, Plus, Turbo) — embeddings nativos incluidos.
  - **Kimi/Moonshot** (K2, 128k, 32k) — ventanas de contexto enormes.
  - **GLM** (4.6, 4 Plus) — roleplay creativo.
  - **MiMo** (7B RL) — modelo pequeno para tareas auxiliares.
  - **Llama 4** via Groq — gratis y ultra-rapido.
- Endpoint para listar proveedores disponibles con API key configurada.
- Seleccion de modelo por campana (cada partida puede usar un modelo distinto).

#### Modelos Mongoose

- **Character**: ficha completa (stats, personalidad, inventario, backstory, HP).
- **World**: lore, genero, tono, facciones, lugares, magia, tecnologia, tags.
- **Campaign**: vincula mundo + personaje, estado de partida, resumen progresivo.
- **Message**: turnos de conversacion (usuario + narrador), token tracking.
- **Memory**: hechos memorables extraidos por IA con embedding vectorial.

#### Motor de narracion RPG

- Funcion central `narrateTurn()` que orquesta todo el ciclo de un turno.
- Construccion automatica del contexto: mundo + personaje + memorias RAG + mensajes recientes + resumen.
- Respuesta del narrador generada por IA con temperatura customizable (0.9 por defecto).
- Sistema de turnos incrementales con historial completo.

#### Memoria RAG (4 capas)

1. **Ventana deslizante**: ultimos N mensajes directos en el prompt.
2. **Memoria semantica**: busqueda vectorial con MongoDB Atlas Vector Search.
3. **Resumenes automaticos**: cuando los mensajes exceden un umbral, se resumen en un parrafo.
4. **Extraccion de hechos**: tras cada turno, la IA identifica eventos, decisiones, interacciones
   y los guarda con embedding para busqueda futura.

#### Endpoints REST

| Metodo   | Ruta                          | Descripcion                                  |
| -------- | ----------------------------- | -------------------------------------------- |
| `GET`    | `/api/characters`             | Listar personajes del usuario                |
| `GET`    | `/api/characters/:id`         | Obtener personaje                            |
| `POST`   | `/api/characters`             | Crear personaje manual                       |
| `PATCH`  | `/api/characters/:id`         | Editar personaje                             |
| `DELETE` | `/api/characters/:id`         | Eliminar personaje                           |
| `POST`   | `/api/characters/generate`    | Generar personaje con IA                     |
| `GET`    | `/api/worlds`                 | Listar mundos del usuario (+ publicos)       |
| `GET`    | `/api/worlds/:id`             | Obtener mundo                                |
| `POST`   | `/api/worlds`                 | Crear mundo manual                           |
| `PATCH`  | `/api/worlds/:id`             | Editar mundo                                 |
| `DELETE` | `/api/worlds/:id`             | Eliminar mundo                               |
| `POST`   | `/api/worlds/generate`        | Generar mundo con IA                         |
| `GET`    | `/api/campaigns`              | Listar campanas                              |
| `GET`    | `/api/campaigns/:id`          | Obtener campana                              |
| `POST`   | `/api/campaigns`              | Crear campana                                |
| `PATCH`  | `/api/campaigns/:id`          | Editar campana                               |
| `DELETE` | `/api/campaigns/:id`          | Eliminar campana + mensajes + memorias       |
| `POST`   | `/api/campaigns/:id/turns`    | **Enviar accion del jugador → narracion IA** |
| `GET`    | `/api/campaigns/:id/log`      | Historial de mensajes (paginado)             |
| `GET`    | `/api/campaigns/:id/memories` | Memorias extraidas de la campana             |
| `GET`    | `/api/ai/providers`           | Listar proveedores IA disponibles            |

#### Utilidades

- Clases de error tipadas: `AppError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ValidationError`, `AIProviderError`.
- Handler global de errores formateando respuestas.
- Validacion de variables de entorno con Zod en `src/config/env.js`.
- Script para crear/actualizar el indice vectorial en Atlas (`npm run vector-index`).

#### Documentacion

- `README.md`: descripcion del proyecto, setup, endpoints, arquitectura.
- `AGENTS.md`: convenciones, reglas de arquitectura, guia para agentes de IA.
- `CHANGELOG.md`: este archivo.
- `.env.example`: plantilla con todas las variables comentadas.
- `.gitignore`: exclusiones estandar.
