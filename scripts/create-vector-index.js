/**
 * Crea (o actualiza) el indice vectorial en MongoDB Atlas para la coleccion `memories`.
 *
 * Requisitos:
 *  - Cluster Atlas M0+ con MongoDB 7.0+.
 *  - Vector Search habilitado (gratis en M0 desde 2024).
 *  - Variable EMBEDDING_DIMENSIONS coherente con el modelo de embeddings que uses.
 *
 * Uso:  npm run vector-index
 */

import { MongoClient } from "mongodb";
import { env } from "../src/config/env.js";

const INDEX_NAME = "memory_vector_index";

async function main() {
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  console.log(`Conectado a ${env.MONGODB_DB_NAME}`);

  const db = client.db(env.MONGODB_DB_NAME);
  const collection = db.collection("memories");

  const existing = await collection.listSearchIndexes().toArray();
  const found = existing.find((i) => i.name === INDEX_NAME);

  const definition = {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: env.EMBEDDING_DIMENSIONS,
        similarity: "cosine",
      },
      {
        type: "filter",
        path: "campaignId",
      },
      {
        type: "filter",
        path: "userId",
      },
    ],
  };

  if (found) {
    console.log(`Indice "${INDEX_NAME}" ya existe. Actualizando definicion...`);
    await collection.updateSearchIndex(INDEX_NAME, definition);
    console.log("Definicion actualizada.");
  } else {
    console.log(
      `Creando indice "${INDEX_NAME}" con ${env.EMBEDDING_DIMENSIONS} dimensiones...`,
    );
    await collection.createSearchIndex({
      name: INDEX_NAME,
      type: "vectorSearch",
      definition,
    });
    console.log("Indice creado. Puede tardar unos minutos en estar READY.");
  }

  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creando indice vectorial:", err);
  process.exit(1);
});
