import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validates a parsed JSON body against a Zod schema.
 * Returns { data } on success or a NextResponse 400 on failure.
 */
export function validate<T>(
  body: unknown,
  schema: z.ZodType<T>
): { data: T } | NextResponse {
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }
  return { data: result.data };
}
