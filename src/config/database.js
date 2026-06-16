import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

export async function connectDatabase(logger) {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    logger.info({ db: env.MONGODB_DB_NAME }, "MongoDB conectado");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "Error de MongoDB");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB desconectado");
  });

  let uri = env.MONGODB_URI;

  try {
    await mongoose.connect(uri, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 3000,
    });
  } catch (err) {
    logger.warn(
      { err: err.message },
      "MongoDB no disponible, iniciando instancia en memoria...",
    );

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();

      await mongoose.disconnect();
      await mongoose.connect(uri, {
        dbName: env.MONGODB_DB_NAME,
      });

      logger.info("MongoDB en memoria iniciado correctamente");
    } catch (memErr) {
      logger.error(
        { err: memErr.message },
        "No se pudo iniciar MongoDB en memoria",
      );
      throw memErr;
    }
  }

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
