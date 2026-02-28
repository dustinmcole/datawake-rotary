import { z } from "zod/v4";
import { tool, type Tool } from "ai";
import { executeTool } from "./tool-executors";

type Role = string;

interface ToolDef {
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: z.ZodObject<any>;
  requiredRoles: Role[];
  contexts: string[];
}

const ALL_MEMBER_ROLES: Role[] = [
  "member", "committee_chair", "uncorked_committee", "board_member",
  "website_admin", "club_admin", "super_admin",
];

// --- Tool definitions (schema only, execute added at request time) ---

const TOOL_DEFS: Record<string, ToolDef> = {
  search_directory: {
    description: "Search the member directory by name, company, or classification.",
    inputSchema: z.object({
      query: z.string().describe("Search term — name, company, or classification"),
    }),
    requiredRoles: ALL_MEMBER_ROLES,
    contexts: ["member", "operations"],
  },
  get_upcoming_events: {
    description: "List upcoming approved club events with dates, locations, and RSVP counts.",
    inputSchema: z.object({
      limit: z.number().optional().describe("Max events to return (default 10)"),
    }),
    requiredRoles: ALL_MEMBER_ROLES,
    contexts: ["member"],
  },
  get_my_attendance: {
    description: "View the current user's attendance record including rate and recent meetings.",
    inputSchema: z.object({
      startDate: z.string().optional().describe("Start date (YYYY-MM-DD). Defaults to current Rotary year."),
      endDate: z.string().optional().describe("End date (YYYY-MM-DD). Defaults to today."),
    }),
    requiredRoles: ALL_MEMBER_ROLES,
    contexts: ["member"],
  },
  get_club_info: {
    description: "Get general club information — meeting times, location, district, and FAQ.",
    inputSchema: z.object({}),
    requiredRoles: ALL_MEMBER_ROLES,
    contexts: ["member"],
  },
  get_committee_info: {
    description: "Get committee details — list all active committees or get members of a specific one.",
    inputSchema: z.object({
      committeeId: z.string().optional().describe("Specific committee ID. If omitted, lists all."),
    }),
    requiredRoles: ALL_MEMBER_ROLES,
    contexts: ["member"],
  },

  // --- Website admin ---
  get_page_content: {
    description: "Read a CMS page's content by its slug (e.g. 'about', 'programs').",
    inputSchema: z.object({
      slug: z.string().describe("Page slug (e.g. 'about', 'programs', 'contact')"),
    }),
    requiredRoles: ["website_admin", "super_admin"],
    contexts: ["website"],
  },
  edit_page_content: {
    description: "Update a CMS page's content. Returns a preview for confirmation before applying.",
    inputSchema: z.object({
      slug: z.string().describe("Page slug to edit"),
      title: z.string().optional().describe("New page title"),
      content: z.string().optional().describe("New page content (markdown)"),
      metaDescription: z.string().optional().describe("New meta description for SEO"),
    }),
    requiredRoles: ["website_admin", "super_admin"],
    contexts: ["website"],
  },
  list_pages: {
    description: "List all CMS pages with their slug, title, published status, and last updated date.",
    inputSchema: z.object({}),
    requiredRoles: ["website_admin", "super_admin"],
    contexts: ["website"],
  },

  // --- Operations ---
  get_attendance_report: {
    description: "Get attendance report for a date range — totals and per-member breakdown.",
    inputSchema: z.object({
      startDate: z.string().describe("Start date (YYYY-MM-DD)"),
      endDate: z.string().describe("End date (YYYY-MM-DD)"),
    }),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },
  get_membership_report: {
    description: "Get membership report — total members, member types, active vs inactive.",
    inputSchema: z.object({}),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },
  create_announcement: {
    description: "Draft a new club announcement. Returns a preview for confirmation before publishing.",
    inputSchema: z.object({
      title: z.string().describe("Announcement title"),
      content: z.string().describe("Announcement body text"),
      category: z.enum(["general", "urgent", "event", "committee"]).describe("Category"),
    }),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },
  manage_event: {
    description: "Approve or reject a pending club event. Returns a preview for confirmation.",
    inputSchema: z.object({
      eventId: z.string().describe("Event ID to manage"),
      action: z.enum(["approve", "reject"]).describe("Action to take"),
    }),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },
  get_pending_events: {
    description: "List events awaiting approval with their details and submitter.",
    inputSchema: z.object({}),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },
  get_membership_inquiries: {
    description: "List new membership inquiries (join requests) not yet processed.",
    inputSchema: z.object({}),
    requiredRoles: ["club_admin", "super_admin"],
    contexts: ["operations"],
  },

  // --- Uncorked ---
  search_sponsors: {
    description: "Search Uncorked sponsor contacts by name, company, or tier.",
    inputSchema: z.object({
      query: z.string().optional().describe("Search term. Omit to return all sponsors."),
    }),
    requiredRoles: ["uncorked_committee", "club_admin", "super_admin"],
    contexts: ["uncorked"],
  },
  search_vendors: {
    description: "Search Uncorked vendor contacts by name, company, or category.",
    inputSchema: z.object({
      query: z.string().optional().describe("Search term. Omit to return all vendors."),
    }),
    requiredRoles: ["uncorked_committee", "club_admin", "super_admin"],
    contexts: ["uncorked"],
  },
  get_budget_summary: {
    description: "Get the Uncorked budget summary — income, expenses, net, and categories.",
    inputSchema: z.object({}),
    requiredRoles: ["uncorked_committee", "club_admin", "super_admin"],
    contexts: ["uncorked"],
  },
};

/**
 * Build tools for a specific context + user, with execute functions bound to userId.
 * Each tool's execute function calls the corresponding executor with user context.
 */
export function getToolsForContext(
  agentContext: string,
  userRoles: string[],
  context: { userId: string; isConfirmation: boolean }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, Tool<any, any>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered: Record<string, Tool<any, any>> = {};

  for (const [name, def] of Object.entries(TOOL_DEFS)) {
    if (!def.contexts.includes(agentContext)) continue;
    if (!def.requiredRoles.some((r) => userRoles.includes(r))) continue;

    filtered[name] = tool({
      description: def.description,
      inputSchema: def.inputSchema,
      execute: async (args) => {
        return executeTool(name, args as Record<string, unknown>, {
          userId: context.userId,
          confirmed: context.isConfirmation,
        });
      },
    });
  }

  return filtered;
}

export function getToolNames(
  agentContext: string,
  userRoles: string[]
): string[] {
  const names: string[] = [];
  for (const [name, def] of Object.entries(TOOL_DEFS)) {
    if (!def.contexts.includes(agentContext)) continue;
    if (!def.requiredRoles.some((r) => userRoles.includes(r))) continue;
    names.push(name);
  }
  return names;
}
