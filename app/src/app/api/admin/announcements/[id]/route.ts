import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { getAnnouncementById, updateAnnouncement, deleteAnnouncement } from "@/lib/queries/announcements";
import { validate } from "@/lib/validations/api-validate";
import { updateAnnouncementSchema } from "@/lib/validations";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  const validated = validate(body, updateAnnouncementSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  try {
    if (data.action === "publish") {
      const updated = await updateAnnouncement(id, { publishedAt: new Date() });
      return NextResponse.json(updated);
    }
    if (data.action === "unpublish") {
      const updated = await updateAnnouncement(id, { publishedAt: null });
      return NextResponse.json(updated);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action: _action, publish: publishFlag, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (typeof publishFlag === "boolean") {
      updateData.publishedAt = publishFlag ? new Date() : null;
    }
    const updated = await updateAnnouncement(id, updateData);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update announcement error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const item = await getAnnouncementById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    await deleteAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete announcement error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
