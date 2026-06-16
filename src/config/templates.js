/**
 * Plantillas de generacion para mundos y personajes.
 * Cada template define el tono, genero y un prompt sugerido para la IA.
 */
export const GENRE_TEMPLATES = {
  "fantasia-epica": {
    label: "Fantasia epica",
    genre: "Fantasia",
    tone: "Epico",
    prompt:
      "Crea un mundo de alta fantasia con reinos ancestrales en guerra, magia arcana prohibida, profecias olvidadas y un mal antiguo que despierta tras milenios de letargo.",
    tags: ["fantasia", "magia", "medieval", "reinos"],
    magicSystem:
      "Magia arcana basada en runas y cristales elementales, accesible a academicos y dotados por sangre.",
    technologyLevel: "Medieval",
  },
  "fantasia-oscura": {
    label: "Fantasia oscura",
    genre: "Fantasia oscura",
    tone: "Sombrío",
    prompt:
      "Un mundo decadente donde la magia corrompe a quien la usa, las ciudades-estado se desmoronan, los dioses han muerto y solo queda sobrevivir entre cenizas y susurros.",
    tags: ["oscuro", "horror", "magia", "maldiciones"],
    magicSystem:
      "Magia de sangre y pactos con entidades sombrias. Toda magia tiene un precio en cordura o vida.",
    technologyLevel: "Medieval tardío",
  },
  cyberpunk: {
    label: "Cyberpunk",
    genre: "Sci-Fi",
    tone: "Distopico",
    prompt:
      "Megaciudades controladas por corporaciones, cuerpo mejorados con implantes, IA omnipresentes y lluvia acida. La humanidad vale lo que su credito bancario.",
    tags: ["tecnologia", "corporaciones", "hackers", "implantes"],
    technologyLevel: "Avanzado (cibernetica, IA, viajes espaciales cercanos)",
  },
  lovecraftiano: {
    label: "Lovecraftiano",
    genre: "Horror cosmico",
    tone: "Inquietante",
    prompt:
      "Pueblos aislados con secretos innombrables, cultos que adoran entidades extradimensionales, libros prohibidos que quiebran la mente. La verdadera naturaleza del universo es aterradora.",
    tags: ["horror", "locura", "cultos", "misterio"],
    magicSystem:
      "Rituales arcanos que consumen cordura. Cada conocimiento sobrenatural aleja al personaje de la realidad.",
    technologyLevel: "1920s / Victoriano",
  },
  "space-opera": {
    label: "Space Opera",
    genre: "Sci-Fi",
    tone: "Aventura",
    prompt:
      "Imperios galacticos, razas alienigenas milenarias, flotas estelares y heroes improbables. Naves surcando el hiperespacio mientras antiguas profecias se cumplen.",
    tags: ["espacio", "alienigenas", "imperio", "naves"],
    technologyLevel:
      "Hiper-avanzado (viajes FTL, energia ilimitada, nanotecnologia)",
  },
  "post-apocaliptico": {
    label: "Post-apocaliptico",
    genre: "Supervivencia",
    tone: "Desolado",
    prompt:
      "El Viejo Mundo colapso. Bandas de saqueadores, zonas irradiadas, tecnologia perdida y asentamientos amurallados son lo unico que queda. La esperanza es un lujo.",
    tags: ["supervivencia", "yermo", "ruinas", "recursos"],
    technologyLevel:
      "Colapsado (restos de tecnologia avanzada, uso de chatarra)",
  },
  "mitologia-nordica": {
    label: "Mitologia nordica",
    genre: "Mitologico",
    tone: "Heroico",
    prompt:
      "Nueve reinos conectados por Yggdrasil. Dioses caprichosos, gigantes amenazantes, valquirias, draugr y el inevitable Ragnarok. El destino esta escrito en runas.",
    tags: ["nordico", "dioses", "vikingos", "runas"],
    magicSystem:
      "Magia runica y seidr. Los dioses otorgan favores a los dignos.",
    technologyLevel: "Era vikinga",
  },
};

export function getTemplate(key) {
  const template = GENRE_TEMPLATES[key];
  if (!template) {
    const available = Object.keys(GENRE_TEMPLATES).join(", ");
    throw new Error(`Plantilla desconocida: ${key}. Disponibles: ${available}`);
  }
  return { ...template };
}

export function getTemplateList() {
  return Object.entries(GENRE_TEMPLATES).map(([key, tpl]) => ({
    key,
    label: tpl.label,
    genre: tpl.genre,
    tone: tpl.tone,
    tags: tpl.tags,
  }));
}
