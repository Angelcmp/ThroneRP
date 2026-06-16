# AGENTS.md

Guia para agentes de IA (Claude Code, opencode, Cursor, etc.) trabajando en este repo.

## Contexto del proyecto

**ThroneRP** = plataforma SaaS de roleplay narrativo donde el usuario crea personajes y mundos, y juega campanas con un narrador IA que **recuerda lo que paso**. Fases 1-4 completas (backend). Frontend y multi-jugador pendientes.

## Stack y convenciones

- Node.js 20+ con **ESM puro** (`"type": "module"`).
- **Fastify 4** como servidor; nunca usar Express.
- **Mongoose 8** para MongoDB. Modelos en `src/models/`.
- **Better-Auth** maneja usuarios/sesiones; NO crear modelo `User` propio.
- **OpenAI SDK** apuntando a multiples `baseURL` para soportar todos los proveedores.
- **Zod** para validacion de env y bodies (schemas en `src/validators/schemas.js`).
- **Vitest** para tests (config en `vitest.config.js`, setup en `test-setup.js`).
- Sin `class`-OOP innecesario: preferir funciones exportadas y modelos Mongoose.
- Sin comentarios decorativos. Solo JSDoc cuando aporte tipos o aclaraciones reales.
- Strings sin tildes en codigo fuente (logs y prompts) para evitar problemas de encoding en consolas; mensajes al usuario final si pueden llevar tildes.

## Reglas de arquitectura

1. **Capas claras**: `routes/` → `services/` → `models/` + `lib/`. Las rutas no acceden a Mongoose directamente excepto consultas triviales.
2. **Autorizacion siempre por `userId`**: cada query debe filtrar por `userId` del request. Lanzar `ForbiddenError` si no coincide.
3. **Errores tipados**: usar las clases de `src/utils/errors.js`. El handler global formatea la respuesta.
4. **Proveedores IA**: anadir nuevos en `src/config/ai-providers.js`. Si son OpenAI-compatible, no requiere codigo nuevo.
5. **Prompts**: vivir en `src/lib/ai/prompts.js`. NUNCA hardcodear prompts en services.
6. **Memoria RAG**: cualquier nuevo tipo de memoria debe ir al enum de `Memory.js` y al `SYSTEM_MEMORY_EXTRACTOR` prompt.
7. **Validacion Zod**: siempre usar `validateBody(schema)` en rutas con request body. Schemas en `src/validators/schemas.js`.
8. **Rate limiting**: usar `config: { rateLimit: { max, timeWindow } }` en opciones de ruta para endpoints sensibles.
9. **Tests**: crear `*.test.js` junto al archivo que se testea. Tests unitarios puros; los de integracion requieren setup de env vars.

## Comandos

```bash
npm run dev          # desarrollo con --watch y .env auto-cargado
npm start            # produccion
npm test             # ejecutar tests (Vitest)
npm run test:watch   # tests en modo watch
npm run test:coverage # tests con cobertura
npm run typecheck    # node --check (sintaxis)
npm run vector-index # crear/actualizar indice vectorial en Atlas
npm run lint         # ESLint
npm run format       # Prettier
```

## Que NO hacer

- No subir `.env` ni claves de API al repo.
- No cambiar la firma de `chatCompletion()` sin actualizar todos los services.
- No anadir Express, Sequelize, ni dependencias redundantes con el stack actual.
- No bloquear el response del turno con `extractAndStoreMemories`: siempre va en `setImmediate`.
- No crear un modelo `User` propio — colisiona con Better-Auth.
- No usar rutas sin Zod validation si tienen request body.
- No eliminar los rate limits de rutas de generacion IA o auth.

## Como anadir una nueva ruta

1. Crear servicio en `src/services/<nombre>.service.js` con funciones exportadas.
2. Crear archivo de rutas en `src/routes/<nombre>.routes.js` exportando un plugin Fastify.
3. Registrar en `src/server.js`.
4. Verificar que tiene `fastify.addHook('preHandler', fastify.requireAuth)` si requiere auth.
5. Anadir Zod schema en `src/validators/schemas.js` y usar `validateBody()`.
6. Crear test en `src/**/<nombre>.test.js`.

## Como anadir un nuevo proveedor de IA

1. Anadir variables `XXX_API_KEY` y `XXX_BASE_URL` a `.env.example` y al schema de `src/config/env.js`.
2. Anadir entrada en `AI_PROVIDERS` de `src/config/ai-providers.js` con sus modelos.
3. Listo. El cliente unificado los usa automaticamente.

## Como anadir una nueva plantilla de generacion

1. Anadir entrada en `GENRE_TEMPLATES` de `src/config/templates.js` con label, genre, tone, tags, prompt y campos relevantes.

## Testing

- Tests unitarios en `src/**/*.test.js`
- El setup (`test-setup.js`) provee MONGODB_URI y BETTER_AUTH_SECRET falsos
- No requieren MongoDB real para correr
- Usar `fastify.inject()` para tests de rutas sin conexion DB
