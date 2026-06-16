import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { env, isProd } from "../config/env.js";

let authInstance = null;

/**
 * Construye la instancia de Better-Auth.
 * Debe llamarse DESPUES de conectar Mongoose, ya que reutiliza su conexion.
 */
export function buildAuth() {
  if (authInstance) return authInstance;

  if (!mongoose.connection?.db) {
    throw new Error(
      "Mongoose debe estar conectado antes de inicializar Better-Auth",
    );
  }

  const socialProviders = {};
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET) {
    socialProviders.discord = {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    };
  }

  authInstance = betterAuth({
    appName: "ThroneRP",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.FRONTEND_URL],
    database: mongodbAdapter(mongoose.connection.db),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
    },
    socialProviders,
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: true, maxAge: 60 * 5 },
    },
    advanced: {
      useSecureCookies: isProd,
    },
  });

  return authInstance;
}

export function getAuth() {
  if (!authInstance) {
    throw new Error("Auth no inicializado. Llama a buildAuth() primero.");
  }
  return authInstance;
}
