import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  unique,
} from "drizzle-orm/pg-core";

// ============================================
// contacts — sponsors + vendors combined
// ============================================
export const contacts = pgTable("contacts", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  company: varchar("company", { length: 256 }).notNull().default(""),
  email: varchar("email", { length: 256 }).notNull().default(""),
  phone: varchar("phone", { length: 64 }).notNull().default(""),
  type: varchar("type", { length: 32 }).notNull(), // ContactType
  status: varchar("status", { length: 32 }).notNull().default("lead"), // PipelineStatus
  tier: varchar("tier", { length: 32 }), // SponsorTier (nullable)
  vendorCategory: varchar("vendor_category", { length: 32 }), // VendorCategory (nullable)
  website: varchar("website", { length: 512 }).notNull().default(""),
  address: varchar("address", { length: 512 }).notNull().default(""),
  notes: text("notes").notNull().default(""),
  tags: text("tags").notNull().default("[]"), // JSON array stored as text
  years: text("years").notNull().default("[]"), // JSON array stored as text
  assignedTo: varchar("assigned_to", { length: 128 }).notNull().default("Unassigned"),
  logoUrl: varchar("logo_url", { length: 1024 }),
  publicVisible: boolean("public_visible").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// activities — 1:many from contacts
// ============================================
export const activities = pgTable("activities", {
  id: varchar("id", { length: 128 }).primaryKey(),
  contactId: varchar("contact_id", { length: 128 }).notNull().references(() => contacts.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 32 }).notNull(), // ActivityType
  description: text("description").notNull().default(""),
  date: varchar("date", { length: 64 }).notNull(),
  createdBy: varchar("created_by", { length: 128 }).notNull().default(""),
});

// ============================================
// meetings
// ============================================
export const meetings = pgTable("meetings", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  date: varchar("date", { length: 16 }).notNull(), // 'YYYY-MM-DD'
  time: varchar("time", { length: 8 }).notNull().default(""), // 'HH:MM'
  attendees: text("attendees").notNull().default("[]"), // JSON array
  notes: text("notes").notNull().default(""),
  category: varchar("category", { length: 32 }).notNull().default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// action_items — 1:many from meetings
// ============================================
export const actionItems = pgTable("action_items", {
  id: varchar("id", { length: 128 }).primaryKey(),
  meetingId: varchar("meeting_id", { length: 128 }).notNull().references(() => meetings.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  assignee: varchar("assignee", { length: 128 }).notNull().default("Unassigned"),
  completed: boolean("completed").notNull().default(false),
  dueDate: varchar("due_date", { length: 16 }), // nullable
});

// ============================================
// tasks
// ============================================
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull().default(""),
  status: varchar("status", { length: 32 }).notNull().default("todo"),
  priority: varchar("priority", { length: 32 }).notNull().default("medium"),
  assignee: varchar("assignee", { length: 128 }).notNull().default("Unassigned"),
  category: varchar("category", { length: 32 }).notNull().default("general"),
  dueDate: varchar("due_date", { length: 16 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// budget_items
// ============================================
export const budgetItems = pgTable("budget_items", {
  id: varchar("id", { length: 128 }).primaryKey(),
  description: varchar("description", { length: 512 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(), // 'income' | 'expense'
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  budgeted: numeric("budgeted", { precision: 10, scale: 2 }).notNull().default("0"),
  date: varchar("date", { length: 16 }).notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// vendor_interest_submissions — public form
// ============================================
export const vendorInterestSubmissions = pgTable("vendor_interest_submissions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  businessName: varchar("business_name", { length: 256 }).notNull(),
  contactName: varchar("contact_name", { length: 256 }).notNull().default(""),
  email: varchar("email", { length: 256 }).notNull().default(""),
  phone: varchar("phone", { length: 64 }).notNull().default(""),
  category: varchar("category", { length: 32 }).notNull().default(""), // VendorCategory
  website: varchar("website", { length: 512 }).notNull().default(""),
  description: text("description").notNull().default(""),
  previousParticipant: boolean("previous_participant").notNull().default(false),
  processed: boolean("processed").notNull().default(false),
  contactId: varchar("contact_id", { length: 128 }).references(() => contacts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// event_config — single-row table
// ============================================
export const eventConfig = pgTable("event_config", {
  id: integer("id").primaryKey().default(1),
  eventName: varchar("event_name", { length: 256 }).notNull().default("Fullerton Uncorked"),
  eventDate: varchar("event_date", { length: 16 }).notNull().default("2026-10-17"),
  eventTime: varchar("event_time", { length: 32 }).notNull().default("5:00 PM – 9:00 PM"),
  venue: varchar("venue", { length: 256 }).notNull().default("Fullerton Family YMCA"),
  venueAddress: varchar("venue_address", { length: 512 }).notNull().default("201 S Basque Ave, Fullerton, CA 92832"),
  ticketUrlGeneral: varchar("ticket_url_general", { length: 1024 }).notNull().default(""),
  ticketUrlVip: varchar("ticket_url_vip", { length: 1024 }).notNull().default(""),
  priceGeneral: numeric("price_general", { precision: 8, scale: 2 }).notNull().default("95"),
  priceVip: numeric("price_vip", { precision: 8, scale: 2 }).notNull().default("125"),
  heroImageUrl: varchar("hero_image_url", { length: 1024 }).notNull().default(""),
});

// ============================================
// NEW TABLES — Platform + Member Portal
// ============================================

// ============================================
// users — extends Clerk user data
// ============================================
export const users = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(), // Clerk user ID
  clerkId: varchar("clerk_id", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull(),
  firstName: varchar("first_name", { length: 128 }).notNull().default(""),
  lastName: varchar("last_name", { length: 128 }).notNull().default(""),
  photoUrl: varchar("photo_url", { length: 1024 }),
  phone: varchar("phone", { length: 64 }).notNull().default(""),
  company: varchar("company", { length: 256 }).notNull().default(""),
  classification: varchar("classification", { length: 128 }).notNull().default(""),
  bio: text("bio").notNull().default(""),
  address: varchar("address", { length: 512 }).notNull().default(""),
  memberSince: date("member_since"),
  memberType: varchar("member_type", { length: 32 }).notNull().default("active"), // active, honorary, alumni, leave, prospect
  status: varchar("status", { length: 32 }).notNull().default("active"), // active, inactive, suspended
  roles: text("roles").notNull().default('["member"]'), // JSON array of role strings
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// committees
// ============================================
export const committees = pgTable("committees", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description").notNull().default(""),
  chairUserId: varchar("chair_user_id", { length: 128 }).references(() => users.id),
  category: varchar("category", { length: 64 }).notNull().default("standing"), // standing, special, ad_hoc
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// committee_memberships
// ============================================
export const committeeMemberships = pgTable(
  "committee_memberships",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    committeeId: varchar("committee_id", { length: 128 }).notNull().references(() => committees.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull().default("member"), // chair, co-chair, member
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.committeeId, t.userId)]
);

// ============================================
// events — member-submitted club events
// ============================================
export const events = pgTable("events", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull().default(""),
  date: varchar("date", { length: 16 }).notNull(), // 'YYYY-MM-DD'
  startTime: varchar("start_time", { length: 8 }).notNull().default(""), // 'HH:MM'
  endTime: varchar("end_time", { length: 8 }).notNull().default(""),
  location: varchar("location", { length: 512 }).notNull().default(""),
  category: varchar("category", { length: 64 }).notNull().default("general"), // meeting, service, social, fundraiser, speaker, general
  rsvpUrl: varchar("rsvp_url", { length: 1024 }).notNull().default(""),
  isPublic: boolean("is_public").notNull().default(false),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending, approved, cancelled
  submittedBy: varchar("submitted_by", { length: 128 }).references(() => users.id),
  approvedBy: varchar("approved_by", { length: 128 }).references(() => users.id),
  slug: varchar("slug", { length: 256 }),
  imageUrl: varchar("image_url", { length: 1024 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// event_rsvps
// ============================================
export const eventRsvps = pgTable(
  "event_rsvps",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    eventId: varchar("event_id", { length: 128 }).notNull().references(() => events.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("attending"), // attending, maybe, declined
    mealChoice: varchar("meal_choice", { length: 64 }),
    guestCount: integer("guest_count").notNull().default(0),
    guestNames: varchar("guest_names", { length: 512 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.eventId, t.userId)]
);

// ============================================
// attendance — weekly meeting attendance
// ============================================
export const attendance = pgTable(
  "attendance",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    date: varchar("date", { length: 16 }).notNull(), // 'YYYY-MM-DD'
    type: varchar("type", { length: 32 }).notNull().default("regular"), // regular, makeup, online, service
    makeupClub: varchar("makeup_club", { length: 256 }),
    notes: text("notes").notNull().default(""),
    recordedBy: varchar("recorded_by", { length: 128 }).references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.date, t.type)]
);

// ============================================
// announcements
// ============================================
export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 128 }).primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }).notNull().default("general"), // general, urgent, event, committee
  authorId: varchar("author_id", { length: 128 }).references(() => users.id),
  pinned: boolean("pinned").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// pages — CMS for public website
// ============================================
export const pages = pgTable("pages", {
  id: varchar("id", { length: 128 }).primaryKey(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull().default(""),
  metaDescription: varchar("meta_description", { length: 512 }).notNull().default(""),
  published: boolean("published").notNull().default(true),
  updatedBy: varchar("updated_by", { length: 128 }).references(() => users.id),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// page_versions — CMS version history
// ============================================
export const pageVersions = pgTable("page_versions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  pageId: varchar("page_id", { length: 128 }).notNull().references(() => pages.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  version: integer("version").notNull(),
  editedBy: varchar("edited_by", { length: 128 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// chat_threads — Bryn conversations
// ============================================
export const chatThreads = pgTable("chat_threads", {
  id: varchar("id", { length: 128 }).primaryKey(),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 256 }).notNull().default("New conversation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// chat_messages — individual messages
// ============================================
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id", { length: 128 }).primaryKey(),
  threadId: varchar("thread_id", { length: 128 }).notNull().references(() => chatThreads.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 16 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  toolCalls: text("tool_calls"), // JSON: tool calls made (for audit)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// membership_inquiries — public join form
// ============================================
export const membershipInquiries = pgTable("membership_inquiries", {
  id: varchar("id", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull().default(""),
  company: varchar("company", { length: 256 }).notNull().default(""),
  classification: varchar("classification", { length: 128 }).notNull().default(""),
  reason: text("reason").notNull().default(""),
  referredBy: varchar("referred_by", { length: 256 }).notNull().default(""),
  status: varchar("status", { length: 32 }).notNull().default("new"), // new, contacted, invited, declined
  processedBy: varchar("processed_by", { length: 128 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// prospects — membership pipeline CRM
// ============================================
export const prospects = pgTable("prospects", {
  id: varchar("id", { length: 128 }).primaryKey(),
  firstName: varchar("first_name", { length: 128 }).notNull(),
  lastName: varchar("last_name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().default(""),
  phone: varchar("phone", { length: 64 }).notNull().default(""),
  company: varchar("company", { length: 256 }).notNull().default(""),
  classification: varchar("classification", { length: 128 }).notNull().default(""),
  source: varchar("source", { length: 32 }).notNull().default("web_inquiry"), // referral, walk_in, community_event, web_inquiry, crm_import
  referredBy: varchar("referred_by", { length: 128 }).references(() => users.id),
  sponsorId: varchar("sponsor_id", { length: 128 }).references(() => users.id),
  stage: varchar("stage", { length: 32 }).notNull().default("identified"), // identified, reached_out, visited, sponsor_found, applied, board_approved, inducted, declined
  stageUpdatedAt: timestamp("stage_updated_at").notNull().defaultNow(),
  nextAction: varchar("next_action", { length: 512 }).notNull().default(""),
  nextActionDue: varchar("next_action_due", { length: 16 }), // 'YYYY-MM-DD'
  convertedUserId: varchar("converted_user_id", { length: 128 }).references(() => users.id),
  sourceInquiryId: varchar("source_inquiry_id", { length: 128 }).references(() => membershipInquiries.id),
  sourceContactId: varchar("source_contact_id", { length: 128 }).references(() => contacts.id),
  notes: text("notes").notNull().default(""),
  createdBy: varchar("created_by", { length: 128 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// prospect_activities — timeline for prospects
// ============================================
export const prospectActivities = pgTable("prospect_activities", {
  id: varchar("id", { length: 128 }).primaryKey(),
  prospectId: varchar("prospect_id", { length: 128 }).notNull().references(() => prospects.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type", { length: 32 }).notNull(), // stage_change, note, call, email, meeting, visit, other
  fromStage: varchar("from_stage", { length: 32 }),
  toStage: varchar("to_stage", { length: 32 }),
  description: text("description").notNull().default(""),
  activityDate: timestamp("activity_date").notNull().defaultNow(),
  loggedBy: varchar("logged_by", { length: 128 }).references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// checkin_sessions — iPad kiosk attendance sessions
// ============================================
export const checkinSessions = pgTable("checkin_sessions", {
  id: varchar("id", { length: 128 }).primaryKey(),
  meetingDate: date("meeting_date").notNull(),
  pin: varchar("pin", { length: 8 }).notNull(),
  openedBy: varchar("opened_by", { length: 128 }).references(() => users.id),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
  isActive: boolean("is_active").notNull().default(true),
  notes: varchar("notes", { length: 512 }).notNull().default(""),
});

// ============================================
// cc_list_mappings — Constant Contact segment → list mapping
// ============================================
export const ccListMappings = pgTable("cc_list_mappings", {
  id: varchar("id", { length: 128 }).primaryKey(),
  segment: varchar("segment", { length: 64 }).notNull().unique(),
  ccListId: varchar("cc_list_id", { length: 256 }).notNull().default(""),
  ccListName: varchar("cc_list_name", { length: 256 }).notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// cc_sync_logs — Constant Contact sync history
// ============================================
export const ccSyncLogs = pgTable("cc_sync_logs", {
  id: varchar("id", { length: 128 }).primaryKey(),
  segment: varchar("segment", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  recordsSynced: integer("records_synced").notNull().default(0),
  recordsFailed: integer("records_failed").notNull().default(0),
  errorMessage: text("error_message"),
  triggeredBy: varchar("triggered_by", { length: 32 }).notNull().default("manual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// cc_config — single-row OAuth + schedule config
// ============================================
export const ccConfig = pgTable("cc_config", {
  id: integer("id").primaryKey().default(1),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  connected: boolean("connected").notNull().default(false),
  syncSchedule: varchar("sync_schedule", { length: 32 }).notNull().default("manual"),
  fieldMappings: text("field_mappings").notNull().default("{}"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
