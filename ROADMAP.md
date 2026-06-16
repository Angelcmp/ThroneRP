# Roadmap

Lista viva de lo que queda pendiente en ThroneRP. Consultar antes de cada sesion de desarrollo para decidir que abordar.

- [x] marcado = listo
- [~] = en progreso
- [ ] = pendiente
- [!] = bloqueado o necesita decision previa

---

## Fase 1: Base solida (actual)

- [x] Backend Fastify con estructura de capas (routes → services → models + lib)
- [x] Autenticacion con Better-Auth (email + OAuth Google/Discord)
- [x] CRUD de personajes, mundos, campanas
- [x] Motor de narracion con IA multi-proveedor
- [x] Sistema de memoria RAG de 4 capas
- [x] Indice vectorial en MongoDB Atlas
- [x] Generacion IA de personajes y mundos
- [x] CHANGELOG, README, AGENTS.md, .env.example

---

## Fase 2: Estabilidad y DX

- [x] Tests de integracion y unitarios (Vitest o Node test runner)
- [x] GitHub Actions CI (lint, test, build check)
- [x] Validacion de bodies con Zod en todas las rutas (ahora solo valida env)
- [x] Rate limiting granular por endpoint (login, generacion IA, turnos)
- [x] Healthcheck real (prueba conexion Mongo + al menos 1 proveedor IA)
- [x] Logger estructurado con niveles (ya esta pino, falta configurarlo bien en prod)
- [x] Dockerfile para desarrollo reproducible
- [x] `.env` con valores de fallback claros para desarrollo local (opcion MongoDB local)

---

## Fase 3: Experiencia de juego

- [x] Streaming de respuestas del narrador (SSE, chunk por chunk como si escribiera)
- [x] Tiradas de dados con sistema configurable (d20, d100, pool custom, etc.)
- [x] Generacion de escenas iniciales (opening scene) con IA al crear campana
- [x] Comandos de jugador interpretados: `/roll d20`, `/look`, `/inventory`, `/stats`
- [x] Estado de personaje dinamico: HP, mana, condiciones, efectos temporales
- [x] Sistema de inventario con equipamiento y modificadores de stats
- [x] Plantillas de generacion: "Fantasia epica", "Cyberpunk", "Lovecraftiano", "Space Opera"
- [x] Editor de mundo visual (generar faction, location, NPC sueltos sin regenerar todo)
- [x] Soporte para modelos de razonamiento (DeepSeek R1, o3-mini) que devuelven `reasoning_content`
- [x] Chunking inteligente de mensajes para no exceder ventana de contexto del modelo

---

## Fase 4: Memoria avanzada

- [x] Scoring y reranking de memorias antes de enviar al prompt (mejor que solo importance)
- [x] Deteccion de contradicciones: si una memoria nueva contradice una vieja, marcar flag
- [x] Memoria jerarquica: resumenes anidados (turno → escena → capitulo → acto)
- [x] Auto-titulado de capitulos: la IA nombra bloques de la historia ("El robo en Puertonegro")
- [x] Exportacion de historial completo (JSON, PDF, Markdown)
- [x] Timeline visual de eventos de la campana

---

## Fase 5: Multi-jugador

- [x] Invitaciones a campana (usuario A invita a usuario B con su personaje)
- [x] Turnos por ronda (todos declaran accion antes de que el narrador resuelva)
- [x] Chat en tiempo real dentro de la campana (WebSocket o polling)
- [x] Permisos: GM (Game Master), player, spectator
- [x] Notas compartidas y visibles para el GM

---

## Fase 6: Monetizacion y comunidad

- [ ] Sistema de suscripciones (Stripe o Paddle)
- [ ] Tier free: Llama 4 gratis + 100 turnos/mes
- [ ] Tier pro: DeepSeek/Qwen/Kimi ilimitado + memorias premium
- [ ] Marketplace de mundos publicos con sistema de likes/forks
- [ ] Perfil publico de usuario con sus personajes y mundos
- [ ] Plantillas comunitarias: compartir prompts de generacion

---

## Fase 7: Frontend (Next.js 16, React 19, Tailwind 4, TypeScript)

- [x] Decision: framework → React / Next.js
- [x] Diseno: paleta, tipografia, wireframes, arquitectura → `DESIGN.md`
- [x] Scaffold Next.js 16 con App Router, Tailwind 4, TypeScript
- [x] Componentes UI base (Button, Input, Card, Badge, Spinner)
- [x] Layout autenticado (Shell con sidebar + header + navegacion)
- [x] Tema oscuro RPG con paleta "Trono y Pergamino" (11 colores, 4 fuentes)
- [x] Landing page publica con hero, 6 features cards, CTA
- [x] Auth pages (login/signup) conectadas al backend con Zustand persist
- [~] Dashboard — UI con campanas/personajes/mundos recientes, datos demo
- [~] Character builder — UI multi-paso (identidad, stats, apariencia, backstory) + boton IA, sin conexion real
- [~] World builder — UI con formulario completo + selector plantillas, sin conexion real
- [~] Pantalla de juego — UI 3-columnas (chat, ficha, estado) con streaming simulado, sin conexion real
- [ ] Integrar dashboard con API real (campanas, personajes, mundos del usuario)
- [ ] Integrar character builder con API de creacion/generacion IA
- [ ] Integrar world builder con API de creacion/generacion IA (facciones, localizaciones)
- [ ] Integrar pantalla de juego con API de turnos, narracion streaming SSE real y comandos
- [ ] Integrar multi-jugador en UI (invitaciones, rondas, chat WebSocket, notas compartidas)
- [ ] Rutas faltantes: `/campaigns/new`, `/characters/[id]`, `/worlds/[id]`
- [ ] Soporte de imagenes generadas (avatares de personaje, escenas ilustradas)

---

## Fase 8: Produccion y escalado

- [ ] Deploy en Railway o Render (backend) + Vercel/Netlify (frontend)
- [ ] Migracion de sesiones de memoria a Redis
- [ ] Cacheo de embeddings para textos repetidos
- [ ] Cola de trabajos (BullMQ) para extraccion de memorias y resumenes
- [ ] Monitoreo y alertas (Sentry, Grafana)
- [ ] Dominio propio con SSL

---

## Ideas a largo plazo (sin prioridad)

- [ ] Editor de reglas personalizadas (el usuario define su propio sistema RPG)
- [ ] Modo "sandbox" sin IA: jugador escribe su propia narracion
- [ ] Integracion con VTT (Virtual Tabletop): mapas, tokens, grid
- [ ] Narrador con voz (TTS)
- [ ] Fine-tuning de modelos con estilo narrativo propio
- [ ] Agentes NPC autonomos que reaccionan entre si fuera del turno del jugador
- [ ] API publica para desarrolladores (crear herramientas sobre ThroneRP)
- [ ] App movil (PWA primero, nativa despues)

---

## Prioridad sugerida (orden para atacar)

1. **Frontend: integrar backend** — conectar UIs existentes con APIs reales (personajes, mundos, campanas, narracion, comandos). Es el cuello de botella.
2. **Frontend: multi-jugador en UI** — rondas, invitaciones, chat WebSocket, notas compartidas. Backend ya listo.
3. **Monetizacion** — suscripciones Stripe/Paddle, tiers free/pro, perfiles publicos.
4. **Produccion** — deploy Railway/Vercel, Redis, colas, monitoreo, dominio.
5. **Marketplace** — mundos publicos, likes/forks, plantillas comunitarias.

> Actualizar este archivo al completar items. Marcar como `[~]` lo que se empiece a desarrollar.
