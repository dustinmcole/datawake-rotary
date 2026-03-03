import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllPages, createPage } from "@/lib/queries/pages";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createPageSchema } from "@/lib/validations";

export async function GET() {
  try {
    const allPages = await getAllPages();
    const { userId } = await auth();
    if (userId) {
      const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "website_admin"]);
      if (isAdmin) return NextResponse.json(allPages);
    }
    const published = allPages.filter((p) => p.published);
    return NextResponse.json(published);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin", "website_admin"]);
    if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const validated = validate(body, createPageSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const page = await createPage({
      id: generateId(),
      slug: data.slug,
      title: data.title,
      content: data.content,
      metaDescription: data.metaDescription,
      published: data.published,
      updatedBy: userId,
      version: 1,
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
