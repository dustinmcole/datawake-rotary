/**
 * Constant Contact API Client
 * OAuth 2.0 + contact/list management
 */

import { db } from "@/lib/db/client";
import { ccConfig, ccListMappings, ccSyncLogs, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

const CC_BASE_URL = "https://api.cc.email/v3";
const CC_AUTH_URL = "https://authz.constantcontact.com/oauth2/default/v1/authorize";
const CC_TOKEN_URL = "https://authz.constantcontact.com/oauth2/default/v1/token";

export interface CCContact {
  email_address: { address: string; permission_to_send?: string };
  first_name?: string;
  last_name?: string;
  phone_numbers?: Array<{ phone_number: string; kind: string }>;
  company_name?: string;
  list_memberships?: string[];
}

export interface CCList {
  list_id: string;
  name: string;
  membership_count?: number;
}

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.CONSTANT_CONTACT_CLIENT_ID ?? "",
    redirect_uri: process.env.CONSTANT_CONTACT_REDIRECT_URI ?? "",
    response_type: "code",
    scope: "contact_data list_data",
    state,
  });
  return `${CC_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? "";
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? "";
  const redirectUri = process.env.CONSTANT_CONTACT_REDIRECT_URI ?? "";
  const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri });
  const res = await fetch(CC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.CONSTANT_CONTACT_CLIENT_ID ?? "";
  const clientSecret = process.env.CONSTANT_CONTACT_CLIENT_SECRET ?? "";
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken });
  const res = await fetch(CC_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error("Failed to refresh token");
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

export async function getValidAccessToken(): Promise<string> {
  const rows = await db.select().from(ccConfig).where(eq(ccConfig.id, 1));
  const config = rows[0];
  if (!config?.accessToken) throw new Error("Not connected to Constant Contact");
  const now = new Date();
  const expiresAt = config.tokenExpiresAt ? new Date(config.tokenExpiresAt) : new Date(0);
  if (config.refreshToken && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const tokens = await refreshAccessToken(config.refreshToken);
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);
    await db.update(ccConfig).set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: newExpiry,
      updatedAt: new Date(),
    }).where(eq(ccConfig.id, 1));
    return tokens.access_token;
  }
  return config.accessToken;
}

async function ccFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();
  return fetch(`${CC_BASE_URL}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
  });
}

export async function getLists(): Promise<CCList[]> {
  const res = await ccFetch("/contact_lists?include_count=true&limit=50");
  if (!res.ok) throw new Error(`Failed to fetch lists: ${await res.text()}`);
  const data = await res.json();
  return data.lists ?? [];
}

export async function createList(name: string): Promise<CCList> {
  const res = await ccFetch("/contact_lists", { method: "POST", body: JSON.stringify({ name, favorite: false }) });
  if (!res.ok) throw new Error(`Failed to create list: ${await res.text()}`);
  return res.json();
}

export async function upsertContact(contact: CCContact): Promise<string> {
  const res = await ccFetch("/contacts/sign_up_form", { method: "POST", body: JSON.stringify(contact) });
  if (!res.ok) throw new Error(`Failed to upsert contact: ${await res.text()}`);
  const data = await res.json();
  return data.contact_id ?? "";
}

export type Segment = "all_members" | "board" | "external_community" | "potential_members" | "full_list";

export const SEGMENT_LABELS: Record<Segment, string> = {
  all_members: "All Members",
  board: "Board",
  external_community: "External / Community",
  potential_members: "Potential Members",
  full_list: "Full List",
};

export const ALL_SEGMENTS: Segment[] = [
  "all_members",
  "board",
  "external_community",
  "potential_members",
  "full_list",
];

export async function getMembersForSegment(segment: Segment) {
  const allMembers = await db.select().from(users);
  switch (segment) {
    case "all_members":
      return allMembers.filter((u) => u.status === "active");
    case "board": {
      return allMembers.filter((u) => {
        const roles = JSON.parse(u.roles || "[]") as string[];
        return roles.some((r) =>
          ["president", "vice_president", "secretary", "treasurer", "board_member", "club_admin", "super_admin"].includes(r)
        );
      });
    }
    case "external_community":
      return allMembers.filter((u) => u.memberType === "honorary" || u.memberType === "alumni");
    case "potential_members":
      return allMembers.filter((u) => u.memberType === "prospect" || u.memberType === "leave");
    case "full_list":
      return allMembers;
    default:
      return [];
  }
}

export async function syncSegment(
  segment: Segment,
  triggeredBy: "manual" | "nightly" | "weekly" = "manual"
): Promise<{ synced: number; failed: number; error?: string }> {
  const logId = generateId();
  let synced = 0;
  let failed = 0;
  let errorMessage: string | undefined;

  try {
    const rows = await db.select().from(ccListMappings).where(eq(ccListMappings.segment, segment));
    const mapping = rows[0];
    if (!mapping?.ccListId) throw new Error(`No CC list mapped for segment: ${segment}`);
    const members = await getMembersForSegment(segment);
    for (const member of members) {
      try {
        await upsertContact({
          email_address: { address: member.email, permission_to_send: "implicit" },
          first_name: member.firstName || undefined,
          last_name: member.lastName || undefined,
          phone_numbers: member.phone ? [{ phone_number: member.phone, kind: "home" }] : undefined,
          company_name: member.company || undefined,
          list_memberships: [mapping.ccListId],
        });
        synced++;
      } catch {
        failed++;
      }
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  await db.insert(ccSyncLogs).values({
    id: logId,
    segment,
    status: errorMessage ? "failed" : failed > 0 ? "partial" : "success",
    recordsSynced: synced,
    recordsFailed: failed,
    errorMessage: errorMessage ?? null,
    triggeredBy,
    createdAt: new Date(),
  });

  return { synced, failed, error: errorMessage };
}
