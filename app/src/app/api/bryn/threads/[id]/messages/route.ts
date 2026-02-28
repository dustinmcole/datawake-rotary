import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { getThreadById, createMessage, updateThread } from "@/lib/queries/chat";
import { generateId } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { id } = await params;
  const thread = await getThreadById(id);
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  if (thread.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json()) as {
    role: string;
    content: string;
    toolCalls?: string;
  };

  if (!body.role || !body.content) {
    return NextResponse.json({ error: "role and content are required" }, { status: 400 });
  }

  const message = await createMessage({
    id: generateId(),
    threadId: id,
    role: body.role,
    content: body.content,
    toolCalls: body.toolCalls ?? null,
  });

  // Touch thread updatedAt
  await updateThread(id, { updatedAt: new Date() });

  return NextResponse.json(message, { status: 201 });
}
