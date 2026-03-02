CREATE TABLE "action_items" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"meeting_id" varchar(128) NOT NULL,
	"text" text NOT NULL,
	"assignee" varchar(128) DEFAULT 'Unassigned' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"due_date" varchar(16)
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"contact_id" varchar(128) NOT NULL,
	"type" varchar(32) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"date" varchar(64) NOT NULL,
	"created_by" varchar(128) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(64) DEFAULT 'general' NOT NULL,
	"author_id" varchar(128),
	"pinned" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"date" varchar(16) NOT NULL,
	"type" varchar(32) DEFAULT 'regular' NOT NULL,
	"makeup_club" varchar(256),
	"notes" text DEFAULT '' NOT NULL,
	"recorded_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_user_id_date_type_unique" UNIQUE("user_id","date","type")
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"description" varchar(512) NOT NULL,
	"category" varchar(32) NOT NULL,
	"type" varchar(16) NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"budgeted" numeric(10, 2) DEFAULT '0' NOT NULL,
	"date" varchar(16) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"thread_id" varchar(128) NOT NULL,
	"role" varchar(16) NOT NULL,
	"content" text NOT NULL,
	"tool_calls" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_threads" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"title" varchar(256) DEFAULT 'New conversation' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkin_sessions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"meeting_date" date NOT NULL,
	"pin" varchar(8) NOT NULL,
	"opened_by" varchar(128),
	"opened_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" varchar(512) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "committee_memberships" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"committee_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"role" varchar(32) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "committee_memberships_committee_id_user_id_unique" UNIQUE("committee_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "committees" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"chair_user_id" varchar(128),
	"category" varchar(64) DEFAULT 'standing' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"company" varchar(256) DEFAULT '' NOT NULL,
	"email" varchar(256) DEFAULT '' NOT NULL,
	"phone" varchar(64) DEFAULT '' NOT NULL,
	"type" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'lead' NOT NULL,
	"tier" varchar(32),
	"vendor_category" varchar(32),
	"website" varchar(512) DEFAULT '' NOT NULL,
	"address" varchar(512) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"tags" text DEFAULT '[]' NOT NULL,
	"years" text DEFAULT '[]' NOT NULL,
	"assigned_to" varchar(128) DEFAULT 'Unassigned' NOT NULL,
	"logo_url" varchar(1024),
	"public_visible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_config" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"event_name" varchar(256) DEFAULT 'Fullerton Uncorked' NOT NULL,
	"event_date" varchar(16) DEFAULT '2026-10-17' NOT NULL,
	"event_time" varchar(32) DEFAULT '5:00 PM – 9:00 PM' NOT NULL,
	"venue" varchar(256) DEFAULT 'Fullerton Family YMCA' NOT NULL,
	"venue_address" varchar(512) DEFAULT '201 S Basque Ave, Fullerton, CA 92832' NOT NULL,
	"ticket_url_general" varchar(1024) DEFAULT '' NOT NULL,
	"ticket_url_vip" varchar(1024) DEFAULT '' NOT NULL,
	"price_general" numeric(8, 2) DEFAULT '95' NOT NULL,
	"price_vip" numeric(8, 2) DEFAULT '125' NOT NULL,
	"hero_image_url" varchar(1024) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"event_id" varchar(128) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"status" varchar(32) DEFAULT 'attending' NOT NULL,
	"meal_choice" varchar(64),
	"guest_count" integer DEFAULT 0 NOT NULL,
	"guest_names" varchar(512),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_rsvps_event_id_user_id_unique" UNIQUE("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"date" varchar(16) NOT NULL,
	"start_time" varchar(8) DEFAULT '' NOT NULL,
	"end_time" varchar(8) DEFAULT '' NOT NULL,
	"location" varchar(512) DEFAULT '' NOT NULL,
	"category" varchar(64) DEFAULT 'general' NOT NULL,
	"rsvp_url" varchar(1024) DEFAULT '' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"submitted_by" varchar(128),
	"approved_by" varchar(128),
	"slug" varchar(256),
	"image_url" varchar(1024),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"date" varchar(16) NOT NULL,
	"time" varchar(8) DEFAULT '' NOT NULL,
	"attendees" text DEFAULT '[]' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"category" varchar(32) DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_inquiries" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"phone" varchar(64) DEFAULT '' NOT NULL,
	"company" varchar(256) DEFAULT '' NOT NULL,
	"classification" varchar(128) DEFAULT '' NOT NULL,
	"reason" text DEFAULT '' NOT NULL,
	"referred_by" varchar(256) DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'new' NOT NULL,
	"processed_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_versions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"page_id" varchar(128) NOT NULL,
	"content" text NOT NULL,
	"version" integer NOT NULL,
	"edited_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"slug" varchar(256) NOT NULL,
	"title" varchar(512) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"meta_description" varchar(512) DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"updated_by" varchar(128),
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "prospect_activities" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"prospect_id" varchar(128) NOT NULL,
	"activity_type" varchar(32) NOT NULL,
	"from_stage" varchar(32),
	"to_stage" varchar(32),
	"description" text DEFAULT '' NOT NULL,
	"activity_date" timestamp DEFAULT now() NOT NULL,
	"logged_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"first_name" varchar(128) NOT NULL,
	"last_name" varchar(128) NOT NULL,
	"email" varchar(256) DEFAULT '' NOT NULL,
	"phone" varchar(64) DEFAULT '' NOT NULL,
	"company" varchar(256) DEFAULT '' NOT NULL,
	"classification" varchar(128) DEFAULT '' NOT NULL,
	"source" varchar(32) DEFAULT 'web_inquiry' NOT NULL,
	"referred_by" varchar(128),
	"sponsor_id" varchar(128),
	"stage" varchar(32) DEFAULT 'identified' NOT NULL,
	"stage_updated_at" timestamp DEFAULT now() NOT NULL,
	"next_action" varchar(512) DEFAULT '' NOT NULL,
	"next_action_due" varchar(16),
	"converted_user_id" varchar(128),
	"source_inquiry_id" varchar(128),
	"source_contact_id" varchar(128),
	"notes" text DEFAULT '' NOT NULL,
	"created_by" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'todo' NOT NULL,
	"priority" varchar(32) DEFAULT 'medium' NOT NULL,
	"assignee" varchar(128) DEFAULT 'Unassigned' NOT NULL,
	"category" varchar(32) DEFAULT 'general' NOT NULL,
	"due_date" varchar(16) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"clerk_id" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"first_name" varchar(128) DEFAULT '' NOT NULL,
	"last_name" varchar(128) DEFAULT '' NOT NULL,
	"photo_url" varchar(1024),
	"phone" varchar(64) DEFAULT '' NOT NULL,
	"company" varchar(256) DEFAULT '' NOT NULL,
	"classification" varchar(128) DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"address" varchar(512) DEFAULT '' NOT NULL,
	"member_since" date,
	"member_type" varchar(32) DEFAULT 'active' NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"roles" text DEFAULT '["member"]' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_interest_submissions" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"business_name" varchar(256) NOT NULL,
	"contact_name" varchar(256) DEFAULT '' NOT NULL,
	"email" varchar(256) DEFAULT '' NOT NULL,
	"phone" varchar(64) DEFAULT '' NOT NULL,
	"category" varchar(32) DEFAULT '' NOT NULL,
	"website" varchar(512) DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"previous_participant" boolean DEFAULT false NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"contact_id" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_thread_id_chat_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chat_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_threads" ADD CONSTRAINT "chat_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin_sessions" ADD CONSTRAINT "checkin_sessions_opened_by_users_id_fk" FOREIGN KEY ("opened_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_memberships" ADD CONSTRAINT "committee_memberships_committee_id_committees_id_fk" FOREIGN KEY ("committee_id") REFERENCES "public"."committees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committee_memberships" ADD CONSTRAINT "committee_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "committees" ADD CONSTRAINT "committees_chair_user_id_users_id_fk" FOREIGN KEY ("chair_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_inquiries" ADD CONSTRAINT "membership_inquiries_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_edited_by_users_id_fk" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospect_activities" ADD CONSTRAINT "prospect_activities_logged_by_users_id_fk" FOREIGN KEY ("logged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_sponsor_id_users_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_converted_user_id_users_id_fk" FOREIGN KEY ("converted_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_source_inquiry_id_membership_inquiries_id_fk" FOREIGN KEY ("source_inquiry_id") REFERENCES "public"."membership_inquiries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_source_contact_id_contacts_id_fk" FOREIGN KEY ("source_contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_interest_submissions" ADD CONSTRAINT "vendor_interest_submissions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;