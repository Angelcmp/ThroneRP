# ThroneRP

Plataforma de **roleplay narrativo con IA** y **memoria persistente**. Permite crear personajes, generar mundos y vivir campanas largas donde el narrador IA recuerda lo que ha sucedido.

> Estado: **MVP - Backend** (Fases 1-4 completas). Frontend pendiente.

---

## Caracteristicas

- Constructor de personajes (manual o generado por IA).
- Generador de mundos completos (lore, facciones, lugares).
- Motor de narracion tipo "dungeon master" con IA.
- **Sistema de memoria de 4 capas** para campanas largas:
  1. Ventana deslizante de mensajes recientes.
  2. Resumenes automaticos de bloques antiguos.
  3. Memoria semantica (RAG) con MongoDB Atlas Vector Search.
  4. Estado estructurado del mundo y personaje siempre en contexto.
- **Memoria avanzada**: reranking por relevancia, deteccion de contradicciones, capitulos con auto-titulado.
- **Multi-proveedor de IA** (todos OpenAI-compatible):
  - DeepSeek · Qwen · Kimi (Moonshot) · GLM (Zhipu) · MiMo (Xiaomi) · Llama 4 (Groq).
- Soporte nativo para modelos de **razonamiento** (DeepSeek R1, o3-mini) con `reasoning_content`.
- **Streaming SSE** de respuestas del narrador en tiempo real.
- **Comandos de jugador**: `/roll`, `/check`, `/look`, `/inventory`, `/stats`, `/character`.
- **Sistema de dados**: d20, 3d6, d%, 4d6kh3, ability checks.
- **Inventario con equipamiento** que modifica stats.
- **Estado dinamico**: HP, mana, condiciones, efectos temporales.
- **Plantillas de generacion**: Fantasia epica, Cyberpunk, Lovecraftiano, Space Opera, etc.
- **Exportacion** de historial completo (JSON, Markdown, HTML imprimible).
- **Timeline visual** de eventos de la campana.
- Autenticacion con email + OAuth (Google / Discord) via Better-Auth.
- API REST limpia con Fastify, validacion Zod, tests (Vitest), CI (GitHub Actions).

---

## Stack

| Capa          | Tecnologia                                    |
| ------------- | --------------------------------------------- |
| Runtime       | Node.js 20+ (probado en 22)                   |
| Servidor      | Fastify 4                                     |
| Base de datos | MongoDB 7+ (Atlas recomendado, Vector Search) |
| ODM           | Mongoose 8                                    |
| Auth          | Better-Auth                                   |
| IA            | OpenAI SDK (apuntando a multiples baseURL)    |
| Validacion    | Zod                                           |
| Testing       | Vitest                                        |
| CI            | GitHub Actions                                |
| Contenedor    | Docker (Node 22-alpine)                       |

---

## Setup rapido

```bash
# 1. Clonar
git clone <tu-repo> && cd ThroneRP

# 2. Instalar
npm install

# 3. Configurar entorno
cp .env.example .env
# Edita .env: anade MONGODB_URI, BETTER_AUTH_SECRET y al menos UNA API key de IA.

# 4. Generar BETTER_AUTH_SECRET
openssl rand -base64 32

# 5. Crear indice vectorial en Atlas (una sola vez)
npm run vector-index

# 6. Arrancar en desarrollo
npm run dev
```

API en `http://localhost:3000`.

---

## MongoDB Atlas (paso a paso)

1. Crea cuenta gratis en https://www.mongodb.com/cloud/atlas
2. Crea un cluster **M0 (gratis)** — incluye Vector Search.
3. **Database Access** — crea un usuario con password.
4. **Network Access** — anade tu IP (o `0.0.0.0/0` en dev).
5. Copia la connection string en `MONGODB_URI`.
6. Ejecuta `npm run vector-index`.

---

## Endpoints principales

### Sistema

- `GET /health` — healthcheck (mongo + proveedores IA)
- `GET /api/ai/providers` — lista proveedores IA disponibles
- `GET /api/templates` — lista plantillas de generacion
- `GET /api/commands` — lista comandos de jugador

### Auth (gestionado por Better-Auth)

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET  /api/auth/get-session`
- OAuth: `GET /api/auth/sign-in/social/{google|discord}`

### Personajes

- `GET    /api/characters`
- `GET    /api/characters/:id`
- `POST   /api/characters`
- `PATCH  /api/characters/:id`
- `DELETE /api/characters/:id`
- `POST   /api/characters/generate` — genera con IA

### Mundos

- `GET    /api/worlds`
- `GET    /api/worlds/:id`
- `POST   /api/worlds`
- `PATCH  /api/worlds/:id`
- `DELETE /api/worlds/:id`
- `POST   /api/worlds/generate` — genera con IA (acepta `template` key)
- `POST   /api/worlds/:id/factions/generate` — genera faccion con IA
- `POST   /api/worlds/:id/locations/generate` — genera ubicacion con IA

### Campanas y narracion

- `GET    /api/campaigns`
- `GET    /api/campaigns/:id`
- `POST   /api/campaigns` — acepta `generateOpening: true`
- `PATCH  /api/campaigns/:id`
- `DELETE /api/campaigns/:id`
- `POST   /api/campaigns/:id/turns` — enviar accion, recibir narracion
- `POST   /api/campaigns/:id/turns/stream` — narracion en streaming SSE
- `POST   /api/campaigns/:id/commands` — ejecutar comando sin turno
- `GET    /api/campaigns/:id/log` — historial
- `GET    /api/campaigns/:id/memories` — memorias extraidas
- `GET    /api/campaigns/:id/timeline` — eventos ordenados por turno
- `GET    /api/campaigns/:id/chapters` — capitulos de la campana
- `GET    /api/campaigns/:id/export/json` — exportar como JSON
- `GET    /api/campaigns/:id/export/markdown` — exportar como Markdown
- `GET    /api/campaigns/:id/export/html` — exportar como HTML imprimible

### Multi-jugador

- `GET    /api/campaigns/:id/players` — listar jugadores (GM + personajes)
- `PATCH  /api/campaigns/:id/players/:userId` — cambiar rol (GM only)
- `DELETE /api/campaigns/:id/players/:userId` — remover jugador (GM only)
- `POST   /api/campaigns/:id/invite` — invitar usuario (GM only)
- `GET    /api/invitations` — invitaciones pendientes del usuario
- `POST   /api/invitations/:token/accept` — aceptar invitacion
- `POST   /api/invitations/:token/decline` — rechazar invitacion

### Notas compartidas

- `POST   /api/campaigns/:id/notes` — crear nota
- `GET    /api/campaigns/:id/notes` — listar notas visibles
- `PATCH  /api/campaigns/:id/notes/:noteId` — editar nota
- `DELETE /api/campaigns/:id/notes/:noteId` — eliminar nota

### Rondas multi-jugador

- `POST   /api/campaigns/:id/rounds/start` — GM abre ronda
- `POST   /api/campaigns/:id/rounds/submit` — enviar accion a la ronda
- `GET    /api/campaigns/:id/rounds/current` — estado de la ronda actual
- `POST   /api/campaigns/:id/rounds/cancel` — GM cancela ronda
- `POST   /api/campaigns/:id/rounds/resolve` — GM resuelve ronda (narracion IA)
- `POST   /api/campaigns/:id/rounds/resolve/stream` — resolucion en streaming SSE
- `POST   /api/campaigns/:id/gm-narrate` — GM narra evento directamente

### Chat en tiempo real

- `WS     /api/campaigns/:id/chat` — WebSocket para chat
- `GET    /api/campaigns/:id/chat/history` — historial de mensajes de chat

---

## Estructura

```
src/
├── server.js              # Entry Fastify
├── config/                # env, mongo, ai-providers, templates
├── lib/
│   ├── auth.js            # Better-Auth
│   └── ai/                # cliente unificado, embeddings, prompts, tokenizer
├── models/                # Mongoose schemas (Character, World, Campaign, Message, Memory)
├── services/              # logica de negocio (narracion, memoria, dados, comandos, export)
├── routes/                # endpoints REST
├── plugins/               # auth.plugin, error-handler
├── validators/            # Zod schemas + validateBody middleware
└── utils/                 # errores tipados
scripts/
├── create-vector-index.js
```

---

## Roadmap

- [x] Streaming SSE + razonamiento (DeepSeek R1, o3-mini)
- [x] Tiradas de dados y comandos de jugador
- [x] Estado dinamico, inventario con equipamiento, capitulos
- [x] Exportacion (JSON, MD, HTML) y timeline
- [x] Multi-jugador: invitaciones, permisos GM/player/spectator, notas, rondas, chat en tiempo real
- [ ] Marketplace de mundos publicos
- [ ] Soporte de imagenes generadas (avatares, escenas)
- [ ] Frontend (React/Vue — pendiente de diseno)

---

## Licencia

Propietario — privado hasta validacion del MVP. Posible apertura como open core posteriormente.
