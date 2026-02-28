import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { getThreadsByUser, createThread } from "@/lib/queries/chat";
import { generateId } from "@/lib/utils";

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
  const title = (body as { title?: string }).title ?? "New conversation";

  const thread = await createThread({
    id: generateId(),
    userId: dbUser.id,
    title,
  });

  return NextResponse.json(thread, { status: 201 });
}
