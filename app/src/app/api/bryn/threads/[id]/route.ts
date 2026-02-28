import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/queries/users";
import { getThreadById, getMessagesByThread } from "@/lib/queries/chat";

export async function GET(
  _req: Request,
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

  const messages = await getMessagesByThread(id);

  return NextResponse.json({ ...thread, messages });
}
