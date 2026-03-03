import type { Config } from "drizzle-kit";
// Import env for validation — drizzle-kit runs on the server (Node.js)
import { env } from "./src/lib/env";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
