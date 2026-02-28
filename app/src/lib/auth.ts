import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, type User as DbUser } from "@/lib/queries/users";

// All supported roles (stored in Clerk publicMetadata.roles)
export type Role =
  | "super_admin"
  | "club_admin"
  | "board_member"
  | "website_admin"
  | "uncorked_committee"
  | "committee_chair"
  | "member"
  | "guest";

// Return type for getCurrentUser()
export interface CurrentUser {
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  roles: Role[];
  dbUser: DbUser | null;
}

// Get the current authenticated user with Clerk data + DB record
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await currentUser();
  if (!user) return null;

  const roles = (user.publicMetadata?.roles as Role[]) ?? ["member"];
  let dbUser: DbUser | null = null;
  try {
    dbUser = await getUserByClerkId(user.id);
  } catch {
    // DB may not be configured yet
  }

  return {
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    roles,
    dbUser,
  };
}

// Get roles for a specific userId (reads from Clerk publicMetadata)
async function getRolesForUser(userId: string): Promise<Role[]> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return (user.publicMetadata?.roles as Role[]) ?? ["member"];
  } catch {
    return [];
  }
}

// Check if a specific user has a role
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getRolesForUser(userId);
  return roles.includes(role);
}

// Check if a specific user has any of the listed roles
export async function hasAnyRole(userId: string, roles: Role[]): Promise<boolean> {
  const userRoles = await getRolesForUser(userId);
  return roles.some((r) => userRoles.includes(r));
}

// Require the current user to have a role — redirect to /portal if not
export async function requireRole(role: Role): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  const has = await hasRole(userId, role);
  if (!has) redirect("/portal");
}

// Require the current user to have any of these roles
export async function requireAnyRole(roles: Role[]): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  const has = await hasAnyRole(userId, roles);
  if (!has) redirect("/portal");
}

// Get current user's Clerk ID (server side)
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

// Role hierarchy (lower index = higher privilege)
const ROLE_HIERARCHY: Role[] = [
  "super_admin",
  "club_admin",
  "board_member",
  "website_admin",
  "uncorked_committee",
  "committee_chair",
  "member",
  "guest",
];

// Get the highest-privilege role for a user
export function getHighestRole(roles: Role[]): Role | null {
  for (const role of ROLE_HIERARCHY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

// Check if roles array includes admin-level access
export function isAdmin(roles: Role[]): boolean {
  return roles.includes("super_admin") || roles.includes("club_admin");
}

// Check if roles array includes uncorked hub access
export function canAccessUncorkedHub(roles: Role[]): boolean {
  return roles.some((r) =>
    ["super_admin", "club_admin", "uncorked_committee"].includes(r)
  );
}
