// ============================================
// Meeting Notes Types
// ============================================
export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  notes: string;
  actionItems: ActionItem[];
  category: MeetingCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assignee: string;
  completed: boolean;
  dueDate?: string;
}

export type MeetingCategory = "planning" | "sponsors" | "vendors" | "logistics" | "marketing" | "general";

// ============================================
// Task Management Types
// ============================================
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  category: TaskCategory;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskCategory = "venue" | "sponsors" | "vendors" | "marketing" | "logistics" | "volunteers" | "entertainment" | "general";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  venue: "Venue",
  sponsors: "Sponsors",
  vendors: "Vendors",
  marketing: "Marketing",
  logistics: "Logistics",
  volunteers: "Volunteers",
  entertainment: "Entertainment",
  general: "General",
};

// ============================================
// Budget Types
// ============================================
export interface BudgetItem {
  id: string;
  description: string;
  category: BudgetCategory;
  type: "income" | "expense";
  amount: number;
  budgeted: number;
  date: string;
  notes: string;
  createdAt: string;
}

export type BudgetCategory =
  | "ticket_sales"
  | "sponsorships"
  | "donations"
  | "venue"
  | "catering"
  | "entertainment"
  | "marketing"
  | "supplies"
  | "insurance"
  | "permits"
  | "staffing"
  | "miscellaneous";

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  ticket_sales: "Ticket Sales",
  sponsorships: "Sponsorships",
  donations: "Donations",
  venue: "Venue",
  catering: "Catering & Food",
  entertainment: "Entertainment",
  marketing: "Marketing & Print",
  supplies: "Supplies & Equipment",
  insurance: "Insurance",
  permits: "Permits & Licenses",
  staffing: "Staffing",
  miscellaneous: "Miscellaneous",
};

export const INCOME_CATEGORIES: BudgetCategory[] = ["ticket_sales", "sponsorships", "donations"];
export const EXPENSE_CATEGORIES: BudgetCategory[] = [
  "venue", "catering", "entertainment", "marketing",
  "supplies", "insurance", "permits", "staffing", "miscellaneous",
];

// ============================================
// CRM Types
// ============================================
export interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: ContactType;
  status: PipelineStatus;
  tier?: SponsorTier;
  vendorCategory?: VendorCategory;
  website: string;
  address: string;
  notes: string;
  activities: Activity[];
  tags: string[];
  years: number[];
  assignedTo: string;
  logoUrl?: string;
  publicVisible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ContactType = "sponsor" | "vendor" | "potential_sponsor" | "potential_vendor";
export type PipelineStatus = "lead" | "contacted" | "interested" | "negotiating" | "committed" | "confirmed";
export type SponsorTier = "title" | "platinum" | "gold" | "silver" | "bronze" | "friend";
export type VendorCategory = "wine" | "beer" | "food" | "entertainment" | "services";

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  date: string;
  createdBy: string;
}

export type ActivityType = "call" | "email" | "meeting" | "note" | "status_change";

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  sponsor: "Sponsor",
  vendor: "Vendor",
  potential_sponsor: "Potential Sponsor",
  potential_vendor: "Potential Vendor",
};

export const PIPELINE_STATUS_LABELS: Record<PipelineStatus, string> = {
  lead: "Lead",
  contacted: "Contacted",
  interested: "Interested",
  negotiating: "Negotiating",
  committed: "Committed",
  confirmed: "Confirmed",
};

export const SPONSOR_TIER_LABELS: Record<SponsorTier, string> = {
  title: "Title",
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  friend: "Friend",
};

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  wine: "Wine",
  beer: "Beer",
  food: "Food",
  entertainment: "Entertainment",
  services: "Services",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Phone Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
  status_change: "Status Change",
};

// ============================================
// App-wide types
// ============================================
export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  responsibilities: string[];
  affiliation: string;
}

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  { id: "jordan", name: "Jordan Garcia", role: "Event Chair", email: "jgarcia@ymcaoc.org", phone: "714-449-5748", responsibilities: ["Lead committee meetings", "Manage Givsum/ticketing", "Coordinate vendors & logistics", "Venue coordination"], affiliation: "Executive Director, Fullerton Family YMCA" },
  { id: "dan", name: "Dan Ouweleen", role: "Co-Chair / Operations", email: "danrotary5320@gmail.com", phone: "714-742-6856", responsibilities: ["Operations co-lead", "Givsum platform admin", "Website management", "Sponsor outreach"], affiliation: "RPIC Zone 26, PDG D5320" },
  { id: "leslie", name: "Leslie McCarthy", role: "Club President", email: "lesliemccarthy23@gmail.com", phone: "714-984-5497", responsibilities: ["Convene meetings", "Vendor relationships", "Fun Committee lead", "Budget coordination"], affiliation: "Rotary Club of Fullerton" },
  { id: "dustin", name: "Dustin Cole", role: "Operations / Tech", email: "dustin.cole@datawakepartners.com", phone: "562-379-3500", responsibilities: ["Website & CMS", "Credit card processing", "Tech infrastructure", "Planning platform"], affiliation: "Datawake" },
  { id: "jim_w", name: "Jim Williams", role: "Vendor Coordinator", email: "jimwilliamsins@gmail.com", phone: "714-404-0848", responsibilities: ["Vendor agreements", "Vendor packages", "Vendor sign-ups", "Vendor outreach"], affiliation: "" },
  { id: "sally", name: "Sally Williams", role: "Decorations / Photo Booth", email: "magickodi@gmail.com", phone: "", responsibilities: ["Decorations inventory", "Photo booth coordination", "Event setup"], affiliation: "" },
  { id: "cathy", name: "Cathy Gach", role: "Treasurer / Finance", email: "cathygach1@gmail.com", phone: "", responsibilities: ["Financial reporting", "Budget tracking", "Zelle payments", "Expense management"], affiliation: "Immediate Past President" },
  { id: "patrick", name: "Patrick Hartnett", role: "President-Elect", email: "phartnett@hartnettlawgroup.com", phone: "", responsibilities: ["Operations team", "DacDB/Salesforce research", "Fundraiser planning"], affiliation: "Hartnett Law Group" },
  { id: "brett", name: "Brett Ackerman", role: "Committee Member", email: "backerman@boysgirlsfullerton.com", phone: "", responsibilities: ["Ticketing input", "Venue suggestions", "Fun Committee"], affiliation: "Boys & Girls Club of Fullerton" },
  { id: "tim", name: "Tim Howells", role: "Responsible Beverage Service", email: "timh@taraschance.org", phone: "", responsibilities: ["Beverage service certification", "Vendor incentives", "Alcohol compliance"], affiliation: "Tara's Chance" },
  { id: "amy", name: "Amy Choi-Wan", role: "Marketing / Social Media", email: "amy.choiwon@gmail.com", phone: "", responsibilities: ["Social media", "Marketing campaigns", "Save-the-date comms", "RBS volunteer"], affiliation: "ROP Career Education Foundation" },
  { id: "andrew", name: "Andrew Gregson", role: "Committee Member", email: "andrew@nocchamber.com", phone: "", responsibilities: ["Meeting space host", "Chamber liaison"], affiliation: "North OC Chamber" },
  { id: "theresa", name: "Theresa Harvey", role: "Vendor Recruitment", email: "tharvey447@gmail.com", phone: "", responsibilities: ["Vendor recruitment", "Vendor outreach", "New vendor sourcing"], affiliation: "" },
  { id: "susan", name: "Susan Ouweleen", role: "Check-In / Admin", email: "susan@assuredav.com", phone: "", responsibilities: ["Guest check-in", "Barcode scanning", "Day-of admin"], affiliation: "" },
  { id: "monica", name: "Monica Fernandez", role: "Committee Member", email: "monica@fullertonhearing.com", phone: "714-871-0632", responsibilities: ["Fun Committee", "Event photography recommendations"], affiliation: "Fullerton Hearing" },
  { id: "dick", name: "Dick Ackerman", role: "Logistics", email: "dickackerman33@gmail.com", phone: "", responsibilities: ["Day-of logistics support"], affiliation: "" },
  { id: "jim_r", name: "Jim Ripley", role: "Committee Member", email: "jpr@raiwm.com", phone: "", responsibilities: ["General committee support"], affiliation: "RAI Wealth Management" },
  { id: "howard", name: "Howard Minkley", role: "Committee Member", email: "hminkley@msn.com", phone: "", responsibilities: ["Fun Committee", "Vendor agreement support"], affiliation: "" },
  { id: "lana", name: "Lana Erlanson", role: "Committee Member", email: "lerlanson@radiantfutures.org", phone: "", responsibilities: ["General committee support"], affiliation: "Radiant Futures" },
  { id: "judy", name: "Judy Atwell", role: "Committee Member", email: "aatwell925@aol.com", phone: "", responsibilities: ["Fun Committee", "Date selection input"], affiliation: "" },
];

export const TEAM_MEMBERS: string[] = [
  "Unassigned",
  ...COMMITTEE_MEMBERS.map(m => m.name),
];
