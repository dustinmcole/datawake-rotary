/**
 * Seed script — migrates static data from store.ts to Neon Postgres.
 *
 * Prerequisites:
 *   1. Run `drizzle-kit push` to create tables
 *   2. Set DATABASE_URL in .env.local
 *
 * Usage:
 *   npx tsx src/lib/db/seed.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

// ============================================================================
// Seed data (extracted from src/lib/store.ts)
// ============================================================================

const now = new Date();
let _id = 1;
const sid = () => `seed_s_${_id++}`;
const vid = () => `seed_v_${_id++}`;

// ---------------------------------------------------------------------------
// Contacts + Activities
// ---------------------------------------------------------------------------

type ContactRow = typeof schema.contacts.$inferInsert;

function makeContact(partial: Partial<ContactRow> & { id: string; name: string; type: string }): ContactRow {
  return {
    company: "",
    email: "",
    phone: "",
    status: "lead",
    tier: null,
    vendorCategory: null,
    website: "",
    address: "",
    notes: "",
    tags: "[]",
    years: "[]",
    assignedTo: "Unassigned",
    logoUrl: null,
    publicVisible: false,
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

type SeedSponsor = {
  id: string;
  name: string;
  company: string;
  tier: string;
  website: string;
  address: string;
  notes: string;
  years: number[];
  tags: string[];
  activities?: { description: string }[];
};

type SeedVendor = {
  id: string;
  name: string;
  company: string;
  vendorCategory: string;
  website: string;
  address: string;
  notes: string;
  years: number[];
  tags: string[];
  activities?: { description: string }[];
};

const SPONSORS: SeedSponsor[] = [
  { id: sid(), name: "Chevron", company: "Chevron", tier: "presenting", website: "", address: "Fullerton, CA", notes: "Diamond/Event sponsor in 2018. Multi-year supporter.", years: [2018], tags: ["diamond", "multi-year", "energy"], activities: [{ description: "Identified from 2018 OC Register article as event sponsor. Multi-year diamond-level supporter." }] },
  { id: sid(), name: "OC Handyman", company: "OC Handyman", tier: "gold", website: "ochandyman.com", address: "Fullerton, CA", notes: "Diamond sponsor, multi-year supporter.", years: [2023, 2024], tags: ["diamond", "multi-year", "home-services"], activities: [{ description: "Identified as multi-year diamond sponsor from Fullerton South Rotary website." }] },
  { id: sid(), name: "LGC Business Solutions", company: "LGC Business Solutions", tier: "gold", website: "", address: "Fullerton, CA", notes: "Event sponsor in 2018. Also listed as table sponsor.", years: [2018], tags: ["event-sponsor", "table-sponsor", "business-services"], activities: [{ description: "Confirmed event sponsor from OC Register 2018 article and table sponsor." }] },
  { id: sid(), name: "Fullerton Oral Surgery", company: "Fullerton Oral Surgery", tier: "gold", website: "", address: "113 W Amerige Ave, Fullerton, CA", notes: "Event sponsor in 2018. Dr. Steven Miyamoto.", years: [2018], tags: ["event-sponsor", "healthcare", "dental"] },
  { id: sid(), name: "Fratellino's Italian Restaurant", company: "Fratellino's Italian Restaurant", tier: "silver", website: "fratellinos.com", address: "600 S Brea Blvd, Brea, CA 92821", notes: "Sponsor in 2024.", years: [2024], tags: ["2024-sponsor", "restaurant", "italian"] },
  { id: sid(), name: "1st Trust", company: "1st Trust", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Financial services company.", years: [2023, 2024], tags: ["table-sponsor", "financial-services"] },
  { id: sid(), name: "The Complete Package", company: "The Complete Package", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor"] },
  { id: sid(), name: "A & V Contractors", company: "A & V Contractors", tier: "silver", website: "", address: "1531 W Commonwealth Ave, Fullerton, CA", notes: "Table sponsor. Licensed General Building, Insulation, Asbestos Abatement.", years: [2023, 2024], tags: ["table-sponsor", "contracting"] },
  { id: sid(), name: "Merrill Lynch", company: "Merrill Lynch", tier: "gold", website: "", address: "Fullerton, CA", notes: "Table sponsor. Wealth management.", years: [2023, 2024], tags: ["table-sponsor", "financial-services", "wealth-management"] },
  { id: sid(), name: "The Robinson Foundation", company: "The Robinson Foundation", tier: "gold", website: "", address: "Fullerton, CA", notes: "Table sponsor. Philanthropic foundation.", years: [2023, 2024], tags: ["table-sponsor", "nonprofit", "philanthropic"] },
  { id: sid(), name: "FLOCK", company: "Fullerton Love of Orange County Kids", tier: "silver", website: "flock.gives", address: "Fullerton, CA", notes: "Table sponsor. 501(c)(3) ending cycle of homelessness for OC children.", years: [2023, 2024], tags: ["table-sponsor", "nonprofit", "youth"] },
  { id: sid(), name: "Fullerton Insurance Service", company: "Fullerton Insurance Service", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "insurance"] },
  { id: sid(), name: "Gallio Motorsports", company: "Gallio Motorsports", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Automotive.", years: [2023, 2024], tags: ["table-sponsor", "automotive"] },
  { id: sid(), name: "Reliance Real Estate Services", company: "Reliance Real Estate Services", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "real-estate"] },
  { id: sid(), name: "White Glove Property Management", company: "White Glove Property Management", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "property-management"] },
  { id: sid(), name: "B & M Cabinets", company: "B & M Cabinets", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "construction"] },
  { id: sid(), name: "Ron Newell Family", company: "Ron Newell Family", tier: "friend", website: "", address: "Fullerton, CA", notes: "Individual/family table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "individual"] },
  { id: sid(), name: "West Fullerton Little League", company: "West Fullerton Little League", tier: "bronze", website: "", address: "1015 W Hill Ave, Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "youth-sports"] },
  { id: sid(), name: "Titan Baseball Academy", company: "Titan Baseball Academy", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. CSUF-affiliated youth sports training.", years: [2023, 2024], tags: ["table-sponsor", "youth-sports"] },
  { id: sid(), name: "Fullerton Families and Friends", company: "Fullerton Families and Friends", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "community"] },
  { id: sid(), name: "Hatae Family Dental", company: "Hatae Family Dental", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "dental", "healthcare"] },
  { id: sid(), name: "Dr. Ed Reichs", company: "Dr. Ed Reichs", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "healthcare"] },
  { id: sid(), name: "Coyote Hills Family Dentistry", company: "Coyote Hills Family Dentistry", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "dental", "healthcare"] },
  { id: sid(), name: "Fullerton First United Methodist Church", company: "Fullerton First United Methodist Church", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "religious", "community"] },
  { id: sid(), name: "The Wine Group", company: "The Wine Group", tier: "gold", website: "", address: "", notes: "Table sponsor. Also wine supplier for the event.", years: [2023, 2024], tags: ["table-sponsor", "wine-industry", "supplier"] },
  { id: sid(), name: "Create-a-Party", company: "Create-a-Party", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Event services.", years: [2023, 2024], tags: ["table-sponsor", "event-services"] },
  { id: sid(), name: "Southern Wine & Spirits", company: "Southern Wine & Spirits", tier: "gold", website: "", address: "", notes: "Table sponsor. Major regional wine and spirits distributor.", years: [2023, 2024], tags: ["table-sponsor", "wine-industry", "distributor"] },
  { id: sid(), name: "Tara's Chance", company: "Tara's Chance", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Equine therapy nonprofit.", years: [2023, 2024], tags: ["table-sponsor", "nonprofit"] },
  { id: sid(), name: "Maggie Weston Real Estate", company: "Maggie Weston Real Estate", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor.", years: [2023, 2024], tags: ["table-sponsor", "real-estate"] },
  { id: sid(), name: "Konica Minolta", company: "Konica Minolta", tier: "silver", website: "", address: "", notes: "Table sponsor. Corporate technology and printing.", years: [2023, 2024], tags: ["table-sponsor", "technology", "corporate"] },
];

const VENDORS: SeedVendor[] = [
  // Food
  { id: vid(), name: "JP23 BBQ", company: "JP23 BBQ", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "BBQ vendor. Drew significant crowds at 2013 event.", years: [2013], tags: ["bbq", "food"], activities: [{ description: "Referenced in 2013 Daily Titan article as popular BBQ vendor." }] },
  { id: vid(), name: "Big B's Barbecue", company: "Big B's Barbecue", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "BBQ vendor.", years: [2013], tags: ["bbq", "food"] },
  { id: vid(), name: "Patty's Cakes", company: "Patty's Cakes", vendorCategory: "food", website: "", address: "825 W Commonwealth Ave, Fullerton, CA", notes: "Specialty desserts and baked goods.", years: [2013], tags: ["desserts", "bakery", "food"] },
  { id: vid(), name: "Heroes Bar & Grill", company: "Heroes Bar & Grill", vendorCategory: "food", website: "heroesfullerton.net", address: "Fullerton, CA", notes: "Bar & grill. Multi-year vendor.", years: [2013, 2018], tags: ["bar-grill", "food", "multi-year"] },
  { id: vid(), name: "Bourbon Street", company: "Bourbon Street", vendorCategory: "food", website: "bourbonstreetfullerton.com", address: "Downtown Fullerton, CA", notes: "Southern-inspired cuisine. Multi-year vendor.", years: [2013, 2018], tags: ["southern", "food", "multi-year"] },
  { id: vid(), name: "The Cellar", company: "The Cellar", vendorCategory: "food", website: "", address: "305 N Harbor Blvd, Fullerton, CA", notes: "Fine French dining. Iconic Fullerton restaurant.", years: [2018], tags: ["fine-dining", "french", "food"] },
  { id: vid(), name: "Collette's Catering", company: "Collette's Catering", vendorCategory: "food", website: "colettesevents.com", address: "1568 Kimberly Ave, Fullerton, CA", notes: "Catering service.", years: [2018], tags: ["catering", "food"] },
  { id: vid(), name: "D'Vine", company: "D'Vine", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant vendor.", years: [2018], tags: ["restaurant", "food"] },
  { id: vid(), name: "Farrell's", company: "Farrell's", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant vendor.", years: [2018], tags: ["restaurant", "food"] },
  { id: vid(), name: "Florentine's", company: "Florentine's", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant.", years: [2018], tags: ["italian", "food"] },
  { id: vid(), name: "The Twisted Vine", company: "The Twisted Vine", vendorCategory: "food", website: "twistedvinewines.com", address: "127 W Commonwealth Ave, Fullerton, CA", notes: "Wine bar and restaurant.", years: [2018], tags: ["wine-bar", "restaurant", "food"] },
  { id: vid(), name: "Roscoe's", company: "Roscoe's", vendorCategory: "food", website: "", address: "Downtown Fullerton, CA", notes: "Famous deli. Handcrafted sandwiches & craft cocktails.", years: [2018], tags: ["deli", "sandwiches", "food"] },
  { id: vid(), name: "Nothing Bundt Cakes", company: "Nothing Bundt Cakes", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Bakery and desserts.", years: [2018], tags: ["bakery", "desserts", "food"] },
  { id: vid(), name: "The Public House", company: "The Public House", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant and bar.", years: [2018], tags: ["bar", "restaurant", "food"] },
  { id: vid(), name: "Mulberry Street", company: "Mulberry Street", vendorCategory: "food", website: "", address: "114 W Wilshire Ave, Fullerton, CA", notes: "Italian restaurant.", years: [2018], tags: ["italian", "restaurant", "food"] },
  { id: vid(), name: "Brownstone Cafe", company: "Brownstone Cafe", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Cafe and restaurant.", years: [2018], tags: ["cafe", "restaurant", "food"] },
  { id: vid(), name: "The Olde Ship", company: "The Olde Ship", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "British pub.", years: [2018], tags: ["british-pub", "restaurant", "food"] },
  { id: vid(), name: "Bruxie", company: "Bruxie", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Waffle sandwiches.", years: [2018], tags: ["waffles", "sandwiches", "food"] },
  { id: vid(), name: "Ziings", company: "Ziings", vendorCategory: "food", website: "", address: "209 N Harbor Blvd, Fullerton, CA", notes: "Bar.", years: [2018], tags: ["bar", "food"] },
  { id: vid(), name: "Les Amis", company: "Les Amis", vendorCategory: "food", website: "lesamisfullerton.com", address: "Fullerton, CA", notes: "Lebanese/Middle Eastern restaurant.", years: [2018], tags: ["lebanese", "middle-eastern", "food"] },
  { id: vid(), name: "Alza Osteria", company: "Alza Osteria", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant.", years: [2018], tags: ["italian", "restaurant", "food"] },
  { id: vid(), name: "Cafe Hidalgo", company: "Hidalgo's Cocina & Cocteles", vendorCategory: "food", website: "hidalgofullerton.com", address: "305 N Harbor Blvd #111, Fullerton, CA", notes: "Modern Southwest cuisine. Owner/Chef Mike Oates, longtime Uncorked participant.", years: [2018], tags: ["southwest", "mexican", "food", "multi-year"] },
  { id: vid(), name: "Gina Maria's", company: "Gina Maria's", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant.", years: [2023, 2024], tags: ["italian", "restaurant", "food"] },
  // Beer
  { id: vid(), name: "The Bruery", company: "The Bruery", vendorCategory: "beer", website: "thebruery.com", address: "Placentia, CA", notes: "Craft brewery. Featured in beer garden.", years: [2023, 2024], tags: ["craft-brewery", "beer-garden"] },
  { id: vid(), name: "Towne Park Brewery & Taproom", company: "Towne Park Brewery & Taproom", vendorCategory: "beer", website: "towneparkbrew.com", address: "Anaheim, CA", notes: "Craft brewery. Beer garden vendor.", years: [2023, 2024], tags: ["craft-brewery", "beer-garden"] },
  { id: vid(), name: "TAPS Fish House & Brewery", company: "TAPS Fish House & Brewery", vendorCategory: "beer", website: "tapsfishhouse.com", address: "Brea, CA", notes: "Craft brewery and restaurant.", years: [2023, 2024], tags: ["craft-brewery"] },
  { id: vid(), name: "Bootlegger's Brewery", company: "Bootlegger's Brewery", vendorCategory: "beer", website: "bootleggers.beer", address: "130 S Highland Ave, Fullerton, CA", notes: "Fullerton's first production brewery, opened 2008.", years: [2023, 2024], tags: ["craft-brewery", "local-fullerton"] },
  { id: vid(), name: "Fullerton Brew Company", company: "Fullerton Brew Company", vendorCategory: "beer", website: "fullertonbrewco.com", address: "Fullerton, CA", notes: "Local Fullerton craft brewery.", years: [2023, 2024], tags: ["craft-brewery", "local-fullerton"] },
  { id: vid(), name: "Hoparazzi Brewing Company", company: "Hoparazzi Brewing Company", vendorCategory: "beer", website: "", address: "Fullerton, CA", notes: "Local craft brewery.", years: [2023, 2024], tags: ["craft-brewery"] },
  { id: vid(), name: "Abita Brewery", company: "Abita Brewery", vendorCategory: "beer", website: "abita.com", address: "Louisiana", notes: "Brewery. 2013 vendor.", years: [2013], tags: ["brewery"] },
  { id: vid(), name: "Hangar 24 Brewery", company: "Hangar 24 Brewery", vendorCategory: "beer", website: "hangar24brewing.com", address: "Redlands, CA", notes: "Craft brewery. 2013 vendor.", years: [2013], tags: ["craft-brewery"] },
  // Entertainment
  { id: vid(), name: "Pulp Vixen", company: "Pulp Vixen", vendorCategory: "entertainment", website: "pulpvixenband.com", address: "Corona, CA", notes: "90s tribute cover band.", years: [2023, 2024], tags: ["band", "cover-band", "90s"] },
  { id: vid(), name: "Grooveline", company: "Grooveline", vendorCategory: "entertainment", website: "", address: "", notes: "Cover/party band.", years: [2022, 2023], tags: ["band", "cover-band"] },
  { id: vid(), name: "The Spazmatics", company: "The Spazmatics", vendorCategory: "entertainment", website: "", address: "", notes: "80s tribute cover band.", years: [2018, 2019], tags: ["band", "cover-band", "80s"] },
  // Other
  { id: vid(), name: "Jewelry Station Gals", company: "Jewelry Station Gals", vendorCategory: "other", website: "", address: "", notes: "Artisan vendor. Decorated wine bottles and fashionable trinkets.", years: [2013], tags: ["artisan", "jewelry"] },
];

// ---------------------------------------------------------------------------
// Meetings + Action Items
// ---------------------------------------------------------------------------

type MeetingRow = typeof schema.meetings.$inferInsert;
type ActionItemRow = typeof schema.actionItems.$inferInsert;

const MEETINGS: Array<MeetingRow & { actionItems: Partial<ActionItemRow>[] }> = [
  {
    id: "mtg_1",
    title: "Fun Committee Meeting",
    date: "2025-10-06",
    time: "12:00",
    attendees: JSON.stringify(["Leslie McCarthy", "Miko Krisvoy", "Monica Fernandez", "Howard Minkley", "Cathy Gach", "Judy Atwell", "Sally Williams", "Brett Ackerman", "Dustin Cole"]),
    notes: "## Pumpkin Run\n- Dan O (through Cathy) reminder about membership drive / club expense\n\n## Halloween Event Planning\n- Sally has decorations\n- Leslie giving Dustin stuff for photo booth\n- Dessert: Zombie donuts\n- Costume contest — Miko and Cathy to judge\n- Prizes: Miko prepared 3 items; Cathy getting scary wine from Twisted Vine\n\n## Christmas Plans\n- No Santa\n- Dustin handles music\n- $65/person",
    category: "general",
    createdAt: new Date("2025-10-06T19:00:00Z"),
    updatedAt: new Date("2025-10-06T19:00:00Z"),
    actionItems: [
      { id: "ai_1_1", text: "Give headcount to Trish a week prior", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-22" },
      { id: "ai_1_2", text: "Print bingo papers, bring photo booth items", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-29" },
      { id: "ai_1_3", text: "Buy witch ring toss game", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-15" },
    ],
  },
  {
    id: "mtg_2",
    title: "Fun Committee Meeting",
    date: "2025-11-13",
    time: "18:00",
    attendees: JSON.stringify(["Leslie McCarthy", "Miko Krisvoy", "Monica Fernandez", "Howard Minkley", "Cathy Gach", "Judy Atwell", "Sally Williams", "Brett Ackerman", "Dustin Cole"]),
    notes: "## Review of Halloween Event\n- General response very positive\n\n## Christmas Party\n- 10am entrance for decorating\n- Photo booth (Dustin)\n- $65 per head, minus $25 for members\n- Activities: Karaoke, Ugly Sweater contest",
    category: "general",
    createdAt: new Date("2025-11-13T02:00:00Z"),
    updatedAt: new Date("2025-11-13T02:00:00Z"),
    actionItems: [
      { id: "ai_2_1", text: "Wait for solid date from Leslie for Christmas event", assignee: "Dustin Cole", completed: true },
      { id: "ai_2_2", text: "Setup Zeffy Campaign for Christmas event", assignee: "Dustin Cole", completed: true, dueDate: "2025-11-18" },
    ],
  },
  {
    id: "mtg_3",
    title: "Fullerton Uncorked Committee Meeting",
    date: "2026-01-23",
    time: "12:00",
    attendees: JSON.stringify(["Jordan Garcia", "Dustin Cole", "Dan Ouweleen", "Kevin", "Patrick Hartnett", "Jim Williams"]),
    notes: "## Event Date Confirmed\n- **October 10, 2026** (Saturday)\n\n## Ticket Pricing\n- Maintained at $95 regular / $125 early entry (VIP)\n\n## Sponsors\n- $5,000 sponsor check from Mike Oates confirmed",
    category: "planning",
    createdAt: new Date("2026-01-23T20:00:00Z"),
    updatedAt: new Date("2026-01-23T20:00:00Z"),
    actionItems: [
      { id: "ai_3_1", text: "Update event website with new details, enable e-ticketing", assignee: "Dustin Cole", completed: false, dueDate: "2026-02-01" },
      { id: "ai_3_2", text: "Send save-the-date via email and social media once website updated", assignee: "Amy Choi-Wan", completed: false, dueDate: "2026-02-15" },
      { id: "ai_3_3", text: "Finalize vendor packets, distribute by 02/15", assignee: "Jordan Garcia", completed: false, dueDate: "2026-02-15" },
      { id: "ai_3_4", text: "Compile hit list of local restaurants, begin vendor outreach", assignee: "Dan Ouweleen", completed: false, dueDate: "2026-02-20" },
      { id: "ai_3_5", text: "Investigate e-ticketing solutions (unique links, QR codes)", assignee: "Dustin Cole", completed: false, dueDate: "2026-02-20" },
      { id: "ai_3_6", text: "Confirm next meeting for Feb 20", assignee: "Jordan Garcia", completed: true },
      { id: "ai_3_7", text: "Follow up with sponsors, update sponsor package materials", assignee: "Unassigned", completed: false },
    ],
  },
  {
    id: "mtg_4",
    title: "Givsum Set-up Meeting",
    date: "2026-01-30",
    time: "12:00",
    attendees: JSON.stringify(["Dustin Cole", "Dan Ouweleen", "Jordan Garcia"]),
    notes: "## E-Ticketing\n- VIP (early access) at $125; general at $95\n- Barcode scanning planned for check-in\n\n## Other Ideas\n- LinkedIn page should be created\n- Should sell tickets at the door\n- Explore Amy Scruggs for digital marketing",
    category: "logistics",
    createdAt: new Date("2026-01-30T20:00:00Z"),
    updatedAt: new Date("2026-01-30T20:00:00Z"),
    actionItems: [
      { id: "ai_4_1", text: "Arrange full committee review of website verbiage at next meeting", assignee: "Jordan Garcia", completed: false, dueDate: "2026-02-20" },
      { id: "ai_4_2", text: "Continue updating Fullerton Uncorked website", assignee: "Dustin Cole", completed: false },
      { id: "ai_4_3", text: "Follow up with Sean about ticket transfer mechanism and barcode scanner", assignee: "Dan Ouweleen", completed: false },
      { id: "ai_4_4", text: "Fix email invitation (update Jordan's email to jgarcia@ymca.org)", assignee: "Dan Ouweleen", completed: false },
    ],
  },
  {
    id: "mtg_5",
    title: "Uncorked Committee Meeting",
    date: "2026-02-27",
    time: "12:00",
    attendees: JSON.stringify(["Jordan Garcia", "Dan Ouweleen", "Leslie McCarthy", "Dustin Cole", "Brett Ackerman", "Monica Fernandez", "Jim Williams"]),
    notes: "## Venue Discussion\n- YMCA Crab Fest is Sept (Jordan's fundraiser)\n- The Charleston — could work but $15k cost\n- **Best bet is the Muck** (Muckenthaler)\n- **Fullerton Plaza** — ~$3.5k for staffing/cleaning/space/deposit\n\n## Entertainment\n- Everyone really wants a **live band**\n\n## Responsibilities\n- **Vendors**: Leslie and Jim in charge\n- **Sponsors**: No sponsorship team yet",
    category: "planning",
    createdAt: new Date("2026-02-27T20:00:00Z"),
    updatedAt: new Date("2026-02-27T20:00:00Z"),
    actionItems: [
      { id: "ai_5_1", text: "Follow up with Farrel at Muckenthaler about venue availability", assignee: "Jordan Garcia", completed: false },
      { id: "ai_5_2", text: "Research Fullerton Plaza availability and costs", assignee: "Jordan Garcia", completed: false },
      { id: "ai_5_3", text: "Send out vendor list showing last year's vendors", assignee: "Leslie McCarthy", completed: false },
      { id: "ai_5_4", text: "Work on event budget draft", assignee: "Jordan Garcia", completed: false },
      { id: "ai_5_5", text: "Put last year's photos on website", assignee: "Dustin Cole", completed: false },
      { id: "ai_5_6", text: "Form a sponsorship outreach team", assignee: "Unassigned", completed: false },
    ],
  },
];

// ============================================================================
// Run
// ============================================================================

async function seed() {
  console.log("🌱 Seeding database...\n");

  // --- Contacts ---
  console.log(`📇 Inserting ${SPONSORS.length} sponsors...`);
  for (const s of SPONSORS) {
    await db.insert(schema.contacts).values(
      makeContact({
        id: s.id,
        name: s.name,
        company: s.company,
        type: "potential_sponsor",
        status: "lead",
        tier: s.tier,
        website: s.website,
        address: s.address,
        notes: s.notes,
        tags: JSON.stringify(s.tags),
        years: JSON.stringify(s.years),
      })
    ).onConflictDoNothing();

    if (s.activities?.length) {
      for (const act of s.activities) {
        await db.insert(schema.activities).values({
          id: `act_${s.id}_${Math.random().toString(36).slice(2)}`,
          contactId: s.id,
          type: "note",
          description: act.description,
          date: now.toISOString(),
          createdBy: "System",
        }).onConflictDoNothing();
      }
    }
  }

  console.log(`🏪 Inserting ${VENDORS.length} vendors...`);
  for (const v of VENDORS) {
    await db.insert(schema.contacts).values(
      makeContact({
        id: v.id,
        name: v.name,
        company: v.company,
        type: "potential_vendor",
        status: "lead",
        vendorCategory: v.vendorCategory,
        website: v.website,
        address: v.address,
        notes: v.notes,
        tags: JSON.stringify(v.tags),
        years: JSON.stringify(v.years),
      })
    ).onConflictDoNothing();

    if (v.activities?.length) {
      for (const act of v.activities) {
        await db.insert(schema.activities).values({
          id: `act_${v.id}_${Math.random().toString(36).slice(2)}`,
          contactId: v.id,
          type: "note",
          description: act.description,
          date: now.toISOString(),
          createdBy: "System",
        }).onConflictDoNothing();
      }
    }
  }

  // --- Meetings ---
  console.log(`📝 Inserting ${MEETINGS.length} meetings...`);
  for (const m of MEETINGS) {
    const { actionItems, ...meetingRow } = m;
    await db.insert(schema.meetings).values(meetingRow).onConflictDoNothing();

    if (actionItems.length) {
      for (const ai of actionItems) {
        await db.insert(schema.actionItems).values({
          id: ai.id!,
          meetingId: m.id!,
          text: ai.text!,
          assignee: ai.assignee ?? "Unassigned",
          completed: ai.completed ?? false,
          dueDate: ai.dueDate ?? null,
        }).onConflictDoNothing();
      }
    }
  }

  console.log("\n✅ Seed complete!");
  console.log(`   ${SPONSORS.length} sponsors`);
  console.log(`   ${VENDORS.length} vendors`);
  console.log(`   ${MEETINGS.length} meetings`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
