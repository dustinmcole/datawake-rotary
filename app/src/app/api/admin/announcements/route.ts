import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAllAnnouncements, createAnnouncement } from "@/lib/queries/announcements";
import { generateId } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const items = await getAllAnnouncements();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, content, category, pinned, publish } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      id: generateId(),
      title,
      content,
      category: category ?? "general",
      authorId: userId,
      pinned: pinned ?? false,
      publishedAt: publish ? new Date() : null,
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    console.error("Create announcement error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
