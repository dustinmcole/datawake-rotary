import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllPages, createPage } from "@/lib/queries/pages";
import { hasAnyRole } from "@/lib/auth";
import { generateId } from "@/lib/utils";

// GET /api/pages — public: returns published pages; admin: returns all
export async function GET() {
  try {
    const allPages = await getAllPages();

    // Check if user is admin — if so, return all pages
    const { userId } = await auth();
    if (userId) {
      const isAdmin = await hasAnyRole(userId, [
        "super_admin",
        "club_admin",
        "website_admin",
      ]);
      if (isAdmin) {
        return NextResponse.json(allPages);
      }
    }

    // Public: only published pages
    const published = allPages.filter((p) => p.published);
    return NextResponse.json(published);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/pages — admin only
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await hasAnyRole(userId, [
      "super_admin",
      "club_admin",
      "website_admin",
    ]);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { slug, title, content, metaDescription, published } = body;

    if (!slug || !title) {
      return NextResponse.json(
        { error: "Slug and title are required" },
        { status: 400 }
      );
    }

    const page = await createPage({
      id: generateId(),
      slug,
      title,
      content: content || "",
      metaDescription: metaDescription || "",
      published: published !== false,
      updatedBy: userId,
      version: 1,
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
