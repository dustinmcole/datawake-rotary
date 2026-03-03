import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { getThreadsByUser, createThread } from "@/lib/queries/chat";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createThreadSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const threads = await getThreadsByUser(dbUser.id);
  return NextResponse.json(threads);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const validated = validate(body, createThreadSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  const thread = await createThread({
    id: generateId(),
    userId: dbUser.id,
    title: data.title,
  });
  return NextResponse.json(thread, { status: 201 });
}
