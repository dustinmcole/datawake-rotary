import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPageBySlug, updatePage, deletePage, createPageVersion } from "@/lib/queries/pages";
import { hasAnyRole } from "@/lib/auth";
import { validate } from "@/lib/validations/api-validate";
import { updatePageSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const page = await getPageBySlug(slug);
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    if (!page.published) {
      const { userId } = await auth();
      if (!userId) return NextResponse.json({ error: "Page not found" }, { status: 404 });
      const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "website_admin"]);
      if (!isAdmin) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "website_admin"]);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { slug } = await params;
    const page = await getPageBySlug(slug);
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    const body = await request.json();
    const validated = validate(body, updatePageSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    await createPageVersion(page.id, page.content, page.version, userId);
    const updated = await updatePage(page.id, {
      title: data.title ?? page.title,
      content: data.content ?? page.content,
      metaDescription: data.metaDescription ?? page.metaDescription,
      published: data.published ?? page.published,
      updatedBy: userId,
      version: page.version + 1,
      updatedAt: new Date(),
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "website_admin"]);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { slug } = await params;
    const page = await getPageBySlug(slug);
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    await deletePage(page.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
