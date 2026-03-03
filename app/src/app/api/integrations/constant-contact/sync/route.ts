import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { syncSegment, ALL_SEGMENTS, Segment } from "@/lib/integrations/constant-contact";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const segment = body.segment as Segment | "all" | undefined;

  try {
    if (!segment || segment === "all") {
      const results: Record<string, { synced: number; failed: number; error?: string }> = {};
      for (const seg of ALL_SEGMENTS) {
        results[seg] = await syncSegment(seg, "manual");
      }
      return NextResponse.json({ ok: true, results });
    } else {
      const result = await syncSegment(segment, "manual");
      return NextResponse.json({ ok: true, result });
    }
  } catch (err) {
    console.error("CC sync error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
