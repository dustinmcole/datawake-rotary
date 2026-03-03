import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { hasAnyRole } from "@/lib/auth";
import { validate } from "@/lib/validations/api-validate";
import { inviteMemberSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const isAdmin = await hasAnyRole(userId, ["super_admin", "club_admin"]);
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const validated = validate(body, inviteMemberSchema);
  if (validated instanceof NextResponse) return validated;
  const { data } = validated;
  try {
    const clerk = await clerkClient();
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: data.email,
      publicMetadata: {
        roles: data.roles,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/register`,
    });
    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (err: unknown) {
    console.error("Invite member error:", err);
    const message = err instanceof Error ? err.message : "Failed to send invitation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
