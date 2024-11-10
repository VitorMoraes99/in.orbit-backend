import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";
export default defineConfig({
  dialect: "postgresql",
  out: './.migrations',
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});