import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 10,
  });

  return drizzle(client, { schema });
}

declare global {
  var __db: PostgresJsDatabase<typeof schema> | undefined;
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}

export type Database = typeof db;
