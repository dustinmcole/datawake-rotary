import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPageBySlug, getVersionHistory } from "@/lib/queries/pages";
import { hasAnyRole } from "@/lib/auth";

type RouteParams = { params: Promise<{ slug: string }> };

// GET /api/pages/[slug]/versions — admin only
export async function GET(_request: Request, { params }: RouteParams) {
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

    const { slug } = await params;
    const page = await getPageBySlug(slug);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const versions = await getVersionHistory(page.id);
    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch version history" },
      { status: 500 }
    );
  }
}
