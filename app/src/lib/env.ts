/**
 * env.ts — Environment variable validation
 *
 * All environment variables are validated here at module load time.
 * If any required variable is missing or malformed, the app will throw
 * immediately with a clear error message rather than failing mysteriously
 * at runtime.
 *
 * Usage:
 *   import { env } from "@/lib/env";
 *   env.DATABASE_URL   // server-side
 *   env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  // client-safe
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Server-side schema (never sent to the browser)
// ---------------------------------------------------------------------------
const serverSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine((v) => v.startsWith("postgres"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),

  CLERK_SECRET_KEY: z
    .string()
    .min(1, "CLERK_SECRET_KEY is required")
    .refine((v) => v.startsWith("sk_"), {
      message: "CLERK_SECRET_KEY must start with 'sk_'",
    }),

  ANTHROPIC_API_KEY: z
    .string()
    .min(1, "ANTHROPIC_API_KEY is required")
    .refine((v) => v.startsWith("sk-ant-"), {
      message: "ANTHROPIC_API_KEY must start with 'sk-ant-'",
    }),

  // Optional server-side vars
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_APP_TOKEN: z.string().optional(),
  CLICKUP_API_TOKEN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  VERCEL: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Client-safe schema (NEXT_PUBLIC_* vars — available in browser too)
// ---------------------------------------------------------------------------
const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required")
    .refine((v) => v.startsWith("pk_"), {
      message: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with 'pk_'",
    }),

  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1).default("/register"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1).default("/portal"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1).default("/portal"),

  // Optional client vars
  NEXT_PUBLIC_APP_URL: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Validation helper — formats Zod errors into readable messages
// ---------------------------------------------------------------------------
function formatErrors(errors: z.ZodError): string {
  return errors.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Validate and export
// ---------------------------------------------------------------------------

/**
 * Validate server-side environment variables.
 * Called only on the server — throws at startup if anything is missing.
 */
function validateServer(): z.infer<typeof serverSchema> {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `\n\u274C Invalid server environment variables:\n${formatErrors(result.error)}\n` +
        `\nCheck your .env.local file against .env.template.\n`,
    );
  }
  return result.data;
}

/**
 * Validate client-safe environment variables.
 * Safe to call on both server and client.
 */
function validateClient(): z.infer<typeof clientSchema> {
  const result = clientSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `\n\u274C Invalid client environment variables:\n${formatErrors(result.error)}\n` +
        `\nCheck your .env.local file against .env.template.\n`,
    );
  }
  return result.data;
}

// On the server: validate everything. On the client: validate client vars only.
const isServer = typeof window === "undefined";

const clientEnv = validateClient();
const serverEnv = isServer ? validateServer() : ({} as z.infer<typeof serverSchema>);

/**
 * Fully-typed, validated environment variables.
 *
 * Server-side vars (DATABASE_URL, CLERK_SECRET_KEY, etc.) are only
 * populated on the server and will be empty objects on the client.
 *
 * Use env.NEXT_PUBLIC_* for anything you need in client components.
 */
export const env = {
  ...clientEnv,
  ...serverEnv,
} as z.infer<typeof clientSchema> & z.infer<typeof serverSchema>;

// Re-export types for convenience
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
