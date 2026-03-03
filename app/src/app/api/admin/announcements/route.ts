import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/queries/users";
import { getAllAnnouncements, createAnnouncement } from "@/lib/queries/announcements";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createAnnouncementSchema } from "@/lib/validations";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const items = await getAllAnnouncements();
    return NextResponse.json(items);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const dbUser = await getUserByClerkId(userId);
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const body = await req.json();
    const validated = validate(body, createAnnouncementSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const announcement = await createAnnouncement({
      id: generateId(),
      title: data.title,
      content: data.content,
      category: data.category,
      authorId: dbUser.id,
      pinned: data.pinned,
      publishedAt: data.publish ? new Date() : null,
    });
    return NextResponse.json(announcement, { status: 201 });
  } catch (err) {
    console.error("Create announcement error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
