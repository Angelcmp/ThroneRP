/**
 * Script de seed para ThroneRP.
 * Usa solo la API REST, no requiere conexion directa a MongoDB.
 *
 * Uso:
 *   1. Arrancar backend: npm run dev
 *   2. Ejecutar:        npm run seed:models
 */

const API = process.env.API_URL || "http://localhost:3000";

const DEMO = {
  name: "Aventurero Demo",
  email: "demo@thronerp.com",
  password: "demo1234",
};

let cookie = "";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3001",
      Referer: "http://localhost:3001/",
      Cookie: cookie,
      ...options.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(body.message || body.error || `Error ${res.status}`);
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  return body;
}

async function seed() {
  console.log("🌱 Sembrando datos demo en ThroneRP...\n");

  // 1. Login
  let userId;
  try {
    const login = await api("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({
        email: DEMO.email,
        password: DEMO.password,
      }),
    });
    userId = login.user?.id || login.user?.userId;
    console.log(`👤 Sesion iniciada: ${DEMO.email}`);
  } catch {
    const signup = await api("/api/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify(DEMO),
    });
    userId = signup.user?.id || signup.user?.userId;
    console.log(`✅ Usuario creado: ${DEMO.email}`);
  }

  // 2. Crear mundo
  let worldId;
  try {
    const worlds = await api("/api/worlds");
    const existing = worlds.worlds?.find((w) => w.name === "Reinos Olvidados");
    if (existing) {
      worldId = existing._id;
      console.log("🌍 Mundo ya existe: Reinos Olvidados");
    } else {
      const created = await api("/api/worlds", {
        method: "POST",
        body: JSON.stringify({
          name: "Reinos Olvidados",
          genre: "Fantasia",
          tone: "Epico",
          premise:
            "Un continente dividido por guerras ancestrales donde la magia se desvanece lentamente.",
          majorConflict:
            "La desaparicion de la magia amenaza el equilibrio entre los reinos",
          magicSystem: "Arcana - los magos canalizan el poder de las estrellas",
          technologyLevel: "Medieval avanzado con artefactos magicos",
          visibility: "public",
          factions: [
            {
              name: "El Consejo Arcano",
              description:
                "Orden de magos que busca restaurar el equilibrio magico",
              alignment: "Neutral",
            },
            {
              name: "La Guardia de Acero",
              description:
                "Faccion militar que protege las fronteras del norte",
              alignment: "Legal",
            },
            {
              name: "Los Hijos de la Sombra",
              description:
                "Culto secreto que adora a la entidad de la oscuridad",
              alignment: "Caotico maligno",
            },
          ],
          locations: [
            {
              name: "Puertonegro",
              description:
                "Ciudad portuaria donde convergen las rutas comerciales",
              type: "Ciudad",
            },
            {
              name: "Bosque Susurrante",
              description:
                "Bosque ancestral donde los arboles guardan memorias",
              type: "Bosque",
            },
            {
              name: "Ciudadela de Piedra",
              description: "Fortaleza enana en la montana sagrada",
              type: "Fortaleza",
            },
            {
              name: "Templo de la Luz Eterna",
              description: "Santuario dedicado a los dioses antiguos",
              type: "Templo",
            },
          ],
        }),
      });
      worldId = created.world?._id || created._id;
      console.log("✅ Mundo creado: Reinos Olvidados");
    }
  } catch (err) {
    console.error("❌ Error creando mundo:", err.message);
    throw err;
  }

  // 3. Crear personaje
  let characterId;
  try {
    const chars = await api("/api/characters");
    const existing = chars.characters?.find((c) => c.name === "Thalion");
    if (existing) {
      characterId = existing._id;
      console.log("👤 Personaje ya existe: Thalion");
    } else {
      const created = await api("/api/characters", {
        method: "POST",
        body: JSON.stringify({
          name: "Thalion",
          race: "Elfo",
          class: "Mago",
          level: 3,
          background:
            "Thalion crecio en los bosques de Lunaria, donde aprendio la magia ancestral. Busca los Fragmentos de la Creacion antes de que caigan en manos equivocadas.",
          appearance:
            "Alto y elegante, cabello plateado, ojos ambar. Tunica azul oscuro con bordados dorados.",
          personality: {
            traits: ["Curioso", "Determinado", "Reservado"],
            ideals: "El conocimiento debe compartirse para el bien comun",
            bonds: "Debo proteger los reinos que mi pueblo abandono",
            flaws: "A veces confio demasiado en la magia",
          },
          stats: { STR: 8, DEX: 14, CON: 12, INT: 18, WIS: 16, CHA: 10 },
          hp: { current: 18, max: 22 },
          mana: { current: 15, max: 20 },
          skills: [
            "Arcano",
            "Historia",
            "Perspicacia",
            "Investigacion",
            "Percepcion",
          ],
          inventory: [
            {
              name: "Baston de roble arcano",
              quantity: 1,
              equipped: true,
              description: "Gema que brilla al detectar magia",
            },
            {
              name: "Pocion curativa",
              quantity: 3,
              description: "Recupera 2d4+2 HP",
            },
            {
              name: "Libro de runas",
              quantity: 1,
              equipped: true,
              description: "Fundamentos de magia runica",
            },
            {
              name: "Raciones",
              quantity: 5,
              description: "Comida seca para el camino",
            },
            {
              name: "Mapa de los reinos",
              quantity: 1,
              description: "Mapa antiguo con caminos olvidados",
            },
          ],
          goals: [
            "Encontrar el Fragmento de la Creacion",
            "Descubrir la verdad detras de la desaparicion de la magia",
          ],
        }),
      });
      characterId = created.character?._id || created._id;
      console.log("✅ Personaje creado: Thalion (nv.3)");
    }
  } catch (err) {
    console.error("❌ Error creando personaje:", err.message);
    throw err;
  }

  // 4. Crear campana
  try {
    const campaigns = await api("/api/campaigns");
    const existing = campaigns.campaigns?.find(
      (c) => c.title === "La Sombra del Dragon",
    );
    if (existing) {
      console.log("📜 Campana ya existe: La Sombra del Dragon");
    } else {
      await api("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          title: "La Sombra del Dragon",
          worldId,
          characterId,
          openingScene:
            "El viento salado del mar golpea tu rostro mientras el barco atraca en el muelle de Puertonegro. Gavieros cantan desde las jarcias mientras los mercaderes descargan barriles de vino y especias. Una figura encapuchada te observa desde la sombra de una taberna. Sostiene un pergamino con tu nombre.",
        }),
      });
      console.log("✅ Campana creada: La Sombra del Dragon");
    }
  } catch (err) {
    console.error("❌ Error creando campana:", err.message);
    throw err;
  }

  // 5. Resumen
  console.log("\n📋 Resumen:");
  console.log(`   URL:    http://localhost:3001`);
  console.log(`   Email:  ${DEMO.email}`);
  console.log(`   Pass:   ${DEMO.password}`);
  console.log("\n✨ Seed completado!");
}

seed().catch((err) => {
  console.error("\n❌ Seed fallo:", err.message);
  process.exit(1);
});
