import { getAllMembers } from "@/lib/queries/users";
import { getUpcomingClubEvents, getClubEventsByStatus } from "@/lib/queries/events-club";
import { getAttendanceByUser, getAttendanceByUserInRange, getRotaryYear } from "@/lib/queries/attendance";
import { getAllCommittees, getCommitteeWithMembers } from "@/lib/queries/committees-club";
import { getPageBySlug, getAllPages, updatePage, createPageVersion } from "@/lib/queries/pages";
import { getAllBudgetItems } from "@/lib/queries/budget";
import { getContactsByType } from "@/lib/queries/contacts";
import { createAnnouncement as dbCreateAnnouncement } from "@/lib/queries/announcements";
import { approveClubEvent, getClubEventById } from "@/lib/queries/events-club";
import { getNewInquiries } from "@/lib/queries/membership-inquiries";
import { generateId } from "@/lib/utils";

// Type for mutation responses that need confirmation
interface ConfirmableResult {
  requiresConfirmation: boolean;
  preview: Record<string, unknown>;
  action: string;
}

// --- Member tools ---

export async function executeSearchDirectory(args: { query: string }) {
  const members = await getAllMembers();
  const q = args.query.toLowerCase();
  const matched = members.filter(
    (m) =>
      m.firstName?.toLowerCase().includes(q) ||
      m.lastName?.toLowerCase().includes(q) ||
      m.company?.toLowerCase().includes(q) ||
      m.classification?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q)
  );
  return matched.slice(0, 20).map((m) => ({
    name: `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
    company: m.company ?? "",
    classification: m.classification ?? "",
    email: m.email,
  }));
}

export async function executeGetUpcomingEvents(args: { limit?: number }) {
  const events = await getUpcomingClubEvents();
  return events.slice(0, args.limit ?? 10).map((e) => ({
    title: e.title,
    date: e.date,
    startTime: e.startTime,
    location: e.location,
    category: e.category,
    slug: e.slug,
  }));
}

export async function executeGetMyAttendance(
  args: { startDate?: string; endDate?: string },
  userId: string
) {
  const rotaryYear = getRotaryYear();
  const start = args.startDate ?? rotaryYear.start;
  const end = args.endDate ?? new Date().toISOString().split("T")[0];

  const records = await getAttendanceByUserInRange(userId, start, end);
  const allRecords = await getAttendanceByUser(userId);

  const regular = records.filter((r) => r.type === "regular").length;
  const makeups = records.filter((r) => r.type === "makeup").length;

  return {
    period: `${start} to ${end}`,
    rotaryYear: rotaryYear.label,
    totalMeetings: records.length,
    regularMeetings: regular,
    makeupMeetings: makeups,
    allTimeTotal: allRecords.length,
    recentRecords: records.slice(0, 10).map((r) => ({
      date: r.date,
      type: r.type,
      makeupClub: r.makeupClub,
    })),
  };
}

export async function executeGetClubInfo() {
  return {
    name: "Rotary Club of Fullerton",
    established: 1924,
    district: 5320,
    meetingDay: "Wednesday",
    meetingTime: "12:00 PM – 1:30 PM",
    location: "Coyote Hills Country Club",
    address: "1440 E Bastanchury Rd, Fullerton, CA 92835",
    motto: "Service Above Self",
    website: "fullertonrotaryclub.com",
    email: "info@fullertonrotaryclub.com",
    fourWayTest: [
      "Is it the TRUTH?",
      "Is it FAIR to all concerned?",
      "Will it build GOODWILL and BETTER FRIENDSHIPS?",
      "Will it be BENEFICIAL to all concerned?",
    ],
  };
}

export async function executeGetCommitteeInfo(args: { committeeId?: string }) {
  if (args.committeeId) {
    const committee = await getCommitteeWithMembers(args.committeeId);
    if (!committee) return { error: "Committee not found." };
    return {
      name: committee.name,
      description: committee.description,
      category: committee.category,
      members: committee.members?.map((m) => ({
        name: `${m.user?.firstName ?? ""} ${m.user?.lastName ?? ""}`.trim(),
        role: m.membership?.role ?? "member",
      })) ?? [],
    };
  }

  const committees = await getAllCommittees();
  return committees.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
  }));
}

// --- Website admin tools ---

export async function executeGetPageContent(args: { slug: string }) {
  const page = await getPageBySlug(args.slug);
  if (!page) return { error: `Page "${args.slug}" not found.` };
  return {
    slug: page.slug,
    title: page.title,
    content: page.content,
    metaDescription: page.metaDescription,
    published: page.published,
    version: page.version,
    updatedAt: page.updatedAt,
  };
}

export async function executeEditPageContent(
  args: { slug: string; title?: string; content?: string; metaDescription?: string },
  confirmed: boolean,
  editorUserId: string
): Promise<ConfirmableResult | Record<string, unknown>> {
  const page = await getPageBySlug(args.slug);
  if (!page) return { error: `Page "${args.slug}" not found.` };

  if (!confirmed) {
    return {
      requiresConfirmation: true,
      action: "edit_page_content",
      preview: {
        slug: args.slug,
        changes: {
          ...(args.title ? { title: { from: page.title, to: args.title } } : {}),
          ...(args.content ? { content: "Content will be updated (preview omitted for brevity)" } : {}),
          ...(args.metaDescription ? { metaDescription: { from: page.metaDescription, to: args.metaDescription } } : {}),
        },
      },
    };
  }

  // Save version snapshot before updating
  await createPageVersion(page.id, page.content ?? "", page.version ?? 1, editorUserId);

  const updated = await updatePage(page.id, {
    ...(args.title ? { title: args.title } : {}),
    ...(args.content ? { content: args.content } : {}),
    ...(args.metaDescription ? { metaDescription: args.metaDescription } : {}),
    version: (page.version ?? 1) + 1,
    updatedBy: editorUserId,
  });

  return {
    success: true,
    slug: updated?.slug,
    newVersion: updated?.version,
  };
}

export async function executeListPages() {
  const pages = await getAllPages();
  return pages.map((p) => ({
    slug: p.slug,
    title: p.title,
    published: p.published,
    version: p.version,
    updatedAt: p.updatedAt,
  }));
}

// --- Operations tools ---

export async function executeGetAttendanceReport(args: {
  startDate: string;
  endDate: string;
}) {
  const members = await getAllMembers();
  const results: { name: string; meetings: number }[] = [];

  for (const member of members) {
    const records = await getAttendanceByUserInRange(
      member.id,
      args.startDate,
      args.endDate
    );
    if (records.length > 0) {
      results.push({
        name: `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim(),
        meetings: records.length,
      });
    }
  }

  results.sort((a, b) => b.meetings - a.meetings);

  return {
    period: `${args.startDate} to ${args.endDate}`,
    totalMembers: members.length,
    membersWithAttendance: results.length,
    topAttendees: results.slice(0, 15),
  };
}

export async function executeGetMembershipReport() {
  const members = await getAllMembers();
  const types: Record<string, number> = {};
  for (const m of members) {
    const t = m.memberType ?? "unknown";
    types[t] = (types[t] ?? 0) + 1;
  }

  return {
    totalActiveMembers: members.length,
    memberTypes: types,
  };
}

export async function executeCreateAnnouncement(
  args: { title: string; content: string; category: string },
  confirmed: boolean,
  authorId: string
): Promise<ConfirmableResult | Record<string, unknown>> {
  if (!confirmed) {
    return {
      requiresConfirmation: true,
      action: "create_announcement",
      preview: {
        title: args.title,
        content: args.content.slice(0, 200) + (args.content.length > 200 ? "..." : ""),
        category: args.category,
      },
    };
  }

  const announcement = await dbCreateAnnouncement({
    id: generateId(),
    title: args.title,
    content: args.content,
    category: args.category,
    authorId,
    publishedAt: new Date(),
  });

  return {
    success: true,
    id: announcement.id,
    title: announcement.title,
  };
}

export async function executeManageEvent(
  args: { eventId: string; action: "approve" | "reject" },
  confirmed: boolean,
  adminId: string
): Promise<ConfirmableResult | Record<string, unknown>> {
  const event = await getClubEventById(args.eventId);
  if (!event) return { error: "Event not found." };

  if (!confirmed) {
    return {
      requiresConfirmation: true,
      action: "manage_event",
      preview: {
        eventTitle: event.title,
        eventDate: event.date,
        currentStatus: event.status,
        proposedAction: args.action,
      },
    };
  }

  if (args.action === "approve") {
    await approveClubEvent(args.eventId, adminId);
    return { success: true, action: "approved", title: event.title };
  } else {
    const { updateClubEvent } = await import("@/lib/queries/events-club");
    await updateClubEvent(args.eventId, { status: "cancelled" });
    return { success: true, action: "rejected", title: event.title };
  }
}

export async function executeGetPendingEvents() {
  const events = await getClubEventsByStatus("pending");
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    location: e.location,
    submittedBy: e.submittedBy,
    createdAt: e.createdAt,
  }));
}

export async function executeGetMembershipInquiries() {
  const inquiries = await getNewInquiries();
  return inquiries.map((i) => ({
    id: i.id,
    name: i.name,
    email: i.email,
    company: i.company,
    classification: i.classification,
    reason: i.reason,
    referredBy: i.referredBy,
    createdAt: i.createdAt,
  }));
}

// --- Uncorked tools ---

export async function executeSearchSponsors(args: { query?: string }) {
  const sponsors = await getContactsByType("sponsor");
  if (!args.query) {
    return sponsors.slice(0, 20).map((s) => ({
      name: s.name,
      company: s.company,
      tier: s.tier,
      status: s.status,
      email: s.email,
    }));
  }
  const q = args.query.toLowerCase();
  return sponsors
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.tier?.toLowerCase().includes(q)
    )
    .slice(0, 20)
    .map((s) => ({
      name: s.name,
      company: s.company,
      tier: s.tier,
      status: s.status,
      email: s.email,
    }));
}

export async function executeSearchVendors(args: { query?: string }) {
  const vendors = await getContactsByType("vendor");
  if (!args.query) {
    return vendors.slice(0, 20).map((v) => ({
      name: v.name,
      company: v.company,
      vendorCategory: v.vendorCategory,
      status: v.status,
      email: v.email,
    }));
  }
  const q = args.query.toLowerCase();
  return vendors
    .filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.vendorCategory?.toLowerCase().includes(q)
    )
    .slice(0, 20)
    .map((v) => ({
      name: v.name,
      company: v.company,
      vendorCategory: v.vendorCategory,
      status: v.status,
      email: v.email,
    }));
}

export async function executeGetBudgetSummary() {
  const items = await getAllBudgetItems();
  let totalIncome = 0;
  let totalExpenses = 0;
  const categories: Record<string, { income: number; expenses: number }> = {};

  for (const item of items) {
    const amount = typeof item.amount === "string" ? parseFloat(item.amount) : item.amount;
    const cat = item.category ?? "Uncategorized";
    if (!categories[cat]) categories[cat] = { income: 0, expenses: 0 };

    if (item.type === "income") {
      totalIncome += amount;
      categories[cat].income += amount;
    } else {
      totalExpenses += amount;
      categories[cat].expenses += amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    net: totalIncome - totalExpenses,
    itemCount: items.length,
    categories,
  };
}

// --- Executor dispatch ---

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: { userId: string; confirmed?: boolean }
): Promise<unknown> {
  switch (toolName) {
    case "search_directory":
      return executeSearchDirectory(args as { query: string });
    case "get_upcoming_events":
      return executeGetUpcomingEvents(args as { limit?: number });
    case "get_my_attendance":
      return executeGetMyAttendance(args as { startDate?: string; endDate?: string }, context.userId);
    case "get_club_info":
      return executeGetClubInfo();
    case "get_committee_info":
      return executeGetCommitteeInfo(args as { committeeId?: string });
    case "get_page_content":
      return executeGetPageContent(args as { slug: string });
    case "edit_page_content":
      return executeEditPageContent(
        args as { slug: string; title?: string; content?: string; metaDescription?: string },
        context.confirmed ?? false,
        context.userId
      );
    case "list_pages":
      return executeListPages();
    case "get_attendance_report":
      return executeGetAttendanceReport(args as { startDate: string; endDate: string });
    case "get_membership_report":
      return executeGetMembershipReport();
    case "create_announcement":
      return executeCreateAnnouncement(
        args as { title: string; content: string; category: string },
        context.confirmed ?? false,
        context.userId
      );
    case "manage_event":
      return executeManageEvent(
        args as { eventId: string; action: "approve" | "reject" },
        context.confirmed ?? false,
        context.userId
      );
    case "get_pending_events":
      return executeGetPendingEvents();
    case "get_membership_inquiries":
      return executeGetMembershipInquiries();
    case "search_sponsors":
      return executeSearchSponsors(args as { query?: string });
    case "search_vendors":
      return executeSearchVendors(args as { query?: string });
    case "get_budget_summary":
      return executeGetBudgetSummary();
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
