import { Meeting, Task, BudgetItem, Contact } from "./types";

const STORAGE_KEYS = {
  meetings: "uncorked_meetings",
  tasks: "uncorked_tasks",
  budget: "uncorked_budget",
  sponsors: "uncorked_sponsors",
  vendors: "uncorked_vendors",
} as const;

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// Meetings
export function getMeetings(): Meeting[] {
  const stored = getFromStorage<Meeting[] | null>(STORAGE_KEYS.meetings, null);
  if (stored !== null) return stored;
  const seeded = getDefaultMeetings();
  setToStorage(STORAGE_KEYS.meetings, seeded);
  return seeded;
}
export function saveMeetings(meetings: Meeting[]): void {
  setToStorage(STORAGE_KEYS.meetings, meetings);
}

// Tasks
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(STORAGE_KEYS.tasks, []);
}
export function saveTasks(tasks: Task[]): void {
  setToStorage(STORAGE_KEYS.tasks, tasks);
}

// Budget
export function getBudgetItems(): BudgetItem[] {
  return getFromStorage<BudgetItem[]>(STORAGE_KEYS.budget, []);
}
export function saveBudgetItems(items: BudgetItem[]): void {
  setToStorage(STORAGE_KEYS.budget, items);
}

// Sponsors
export function getSponsors(): Contact[] {
  const stored = getFromStorage<Contact[] | null>(STORAGE_KEYS.sponsors, null);
  if (stored !== null) return stored;
  // First load — seed with default data
  const seeded = getDefaultSponsors();
  setToStorage(STORAGE_KEYS.sponsors, seeded);
  return seeded;
}
export function saveSponsors(sponsors: Contact[]): void {
  setToStorage(STORAGE_KEYS.sponsors, sponsors);
}

// Vendors
export function getVendors(): Contact[] {
  const stored = getFromStorage<Contact[] | null>(STORAGE_KEYS.vendors, null);
  if (stored !== null) return stored;
  // First load — seed with default data
  const seeded = getDefaultVendors();
  setToStorage(STORAGE_KEYS.vendors, seeded);
  return seeded;
}
export function saveVendors(vendors: Contact[]): void {
  setToStorage(STORAGE_KEYS.vendors, vendors);
}

// Legacy contacts (for backward compat with old CRM page if needed)
export function getContacts(): Contact[] {
  return [...getSponsors(), ...getVendors()];
}
export function saveContacts(contacts: Contact[]): void {
  saveSponsors(contacts.filter(c => c.type === "sponsor" || c.type === "potential_sponsor"));
  saveVendors(contacts.filter(c => c.type === "vendor" || c.type === "potential_vendor"));
}

// ============================================
// Seed Data — Real sponsors from research
// ============================================
let _idCounter = 1;
function sid(): string { return `seed_s_${_idCounter++}`; }
function vid(): string { return `seed_v_${_idCounter++}`; }
const now = new Date().toISOString();

function getDefaultSponsors(): Contact[] {
  return [
    // Diamond Sponsors
    { id: sid(), name: "Chevron", company: "Chevron", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "title", website: "", address: "Fullerton, CA", notes: "Diamond/Event sponsor in 2018. Multi-year supporter. Major energy company with local Fullerton presence.", activities: [{ id: "a1", type: "note", description: "Identified from 2018 OC Register article as event sponsor. Has been a multi-year diamond-level supporter.", date: now, createdBy: "System" }], tags: ["diamond", "multi-year", "energy"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "OC Handyman", company: "OC Handyman", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "ochandyman.com", address: "Fullerton, CA", notes: "Diamond sponsor, multi-year supporter. Home services company.", activities: [{ id: "a2", type: "note", description: "Identified as multi-year diamond sponsor from Fullerton South Rotary website.", date: now, createdBy: "System" }], tags: ["diamond", "multi-year", "home-services"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // Event Sponsors
    { id: sid(), name: "LGC Business Solutions", company: "LGC Business Solutions", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "Fullerton, CA", notes: "Event sponsor in 2018. Also listed as table sponsor.", activities: [{ id: "a3", type: "note", description: "Confirmed event sponsor from OC Register 2018 article and table sponsor from Rotary site.", date: now, createdBy: "System" }], tags: ["event-sponsor", "table-sponsor", "business-services"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Fullerton Oral Surgery", company: "Fullerton Oral Surgery", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "113 W Amerige Ave, Fullerton, CA", notes: "Event sponsor in 2018. Dr. Steven Miyamoto.", activities: [{ id: "a4", type: "note", description: "Confirmed event sponsor from 2018 OC Register article.", date: now, createdBy: "System" }], tags: ["event-sponsor", "healthcare", "dental"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // 2024 Sponsors
    { id: sid(), name: "Fratellino's Italian Restaurant", company: "Fratellino's Italian Restaurant", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "fratellinos.com", address: "600 S Brea Blvd, Brea, CA 92821", notes: "Sponsor in 2024.", activities: [{ id: "a5", type: "note", description: "Confirmed 2024 sponsor from fullertonuncorked.org/2024-sponsors page.", date: now, createdBy: "System" }], tags: ["2024-sponsor", "restaurant", "italian"], years: [2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // Table Sponsors
    { id: sid(), name: "1st Trust", company: "1st Trust", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Financial services company.", activities: [{ id: "a6", type: "note", description: "Listed as table sponsor on Fullerton South Rotary website.", date: now, createdBy: "System" }], tags: ["table-sponsor", "financial-services"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "The Complete Package", company: "The Complete Package", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor.", activities: [], tags: ["table-sponsor"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "A & V Contractors", company: "A & V Contractors", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "1531 W Commonwealth Ave, Fullerton, CA", notes: "Table sponsor. Licensed General Building, Insulation, Asbestos Abatement.", activities: [], tags: ["table-sponsor", "contracting"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Merrill Lynch", company: "Merrill Lynch", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "Fullerton, CA", notes: "Table sponsor. Wealth management.", activities: [], tags: ["table-sponsor", "financial-services", "wealth-management"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "The Robinson Foundation", company: "The Robinson Foundation", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "Fullerton, CA", notes: "Table sponsor. Philanthropic foundation.", activities: [], tags: ["table-sponsor", "nonprofit", "philanthropic"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "FLOCK", company: "Fullerton Love of Orange County Kids", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "flock.gives", address: "Fullerton, CA", notes: "Table sponsor. 501(c)(3) ending cycle of homelessness for OC children.", activities: [], tags: ["table-sponsor", "nonprofit", "youth"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Fullerton Insurance Service", company: "Fullerton Insurance Service", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Insurance services.", activities: [], tags: ["table-sponsor", "insurance"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Gallio Motorsports", company: "Gallio Motorsports", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Automotive.", activities: [], tags: ["table-sponsor", "automotive"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Reliance Real Estate Services", company: "Reliance Real Estate Services", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Also presenting sponsor of Day of Music Fullerton 2023.", activities: [], tags: ["table-sponsor", "real-estate"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "White Glove Property Management", company: "White Glove Property Management", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Property management.", activities: [], tags: ["table-sponsor", "property-management"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "B & M Cabinets", company: "B & M Cabinets", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Cabinetry and construction.", activities: [], tags: ["table-sponsor", "construction"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Ron Newell Family", company: "Ron Newell Family", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "friend", website: "", address: "Fullerton, CA", notes: "Individual/family table sponsor.", activities: [], tags: ["table-sponsor", "individual"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "West Fullerton Little League", company: "West Fullerton Little League", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "1015 W Hill Ave, Fullerton, CA", notes: "Table sponsor. Youth sports, founded 1957.", activities: [], tags: ["table-sponsor", "youth-sports"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Titan Baseball Academy", company: "Titan Baseball Academy", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. CSUF-affiliated youth sports training.", activities: [], tags: ["table-sponsor", "youth-sports", "csuf"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Fullerton Families and Friends", company: "Fullerton Families and Friends", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Community group.", activities: [], tags: ["table-sponsor", "community"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Hatae Family Dental", company: "Hatae Family Dental", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Dental practice.", activities: [], tags: ["table-sponsor", "dental", "healthcare"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Dr. Ed Reichs", company: "Dr. Ed Reichs", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Healthcare provider.", activities: [], tags: ["table-sponsor", "healthcare"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Coyote Hills Family Dentistry", company: "Coyote Hills Family Dentistry", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "Fullerton, CA", notes: "Table sponsor. Dental practice near Coyote Hills Golf Course.", activities: [], tags: ["table-sponsor", "dental", "healthcare"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Fullerton First United Methodist Church", company: "Fullerton First United Methodist Church", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Religious organization.", activities: [], tags: ["table-sponsor", "religious", "community"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "The Wine Group", company: "The Wine Group", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "", notes: "Table sponsor. One of the world's largest wine companies. Also wine supplier for the event.", activities: [], tags: ["table-sponsor", "wine-industry", "supplier"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Create-a-Party", company: "Create-a-Party", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Event services and party supplies.", activities: [], tags: ["table-sponsor", "event-services"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Southern Wine & Spirits", company: "Southern Wine & Spirits", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "gold", website: "", address: "", notes: "Table sponsor. Major regional wine and spirits distributor.", activities: [], tags: ["table-sponsor", "wine-industry", "distributor"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Tara's Chance", company: "Tara's Chance", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Equine therapy nonprofit.", activities: [], tags: ["table-sponsor", "nonprofit", "equine-therapy"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Maggie Weston Real Estate", company: "Maggie Weston Real Estate", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "bronze", website: "", address: "Fullerton, CA", notes: "Table sponsor. Real estate services.", activities: [], tags: ["table-sponsor", "real-estate"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: sid(), name: "Konica Minolta", company: "Konica Minolta", email: "", phone: "", type: "potential_sponsor", status: "lead", tier: "silver", website: "", address: "", notes: "Table sponsor. Corporate technology and printing company.", activities: [], tags: ["table-sponsor", "technology", "corporate"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
  ];
}

function getDefaultVendors(): Contact[] {
  return [
    // === FOOD VENDORS ===
    // 2013 Vendors
    { id: vid(), name: "JP23 BBQ", company: "JP23 BBQ", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "BBQ vendor. Drew significant crowds at 2013 event.", activities: [{ id: "v1", type: "note", description: "Referenced in 2013 Daily Titan article as popular BBQ vendor.", date: now, createdBy: "System" }], tags: ["bbq", "food"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Big B's Barbecue", company: "Big B's Barbecue", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "BBQ vendor. Drew significant crowds at 2013 event.", activities: [], tags: ["bbq", "food"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Patty's Cakes", company: "Patty's Cakes", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "825 W Commonwealth Ave, Fullerton, CA", notes: "Specialty desserts and baked goods. Known for whipped desserts.", activities: [], tags: ["desserts", "bakery", "food"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Heroes Bar & Grill", company: "Heroes Bar & Grill", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "heroesfullerton.net", address: "Fullerton, CA", notes: "Bar & grill. Multi-year vendor (2013, 2018).", activities: [], tags: ["bar-grill", "food", "multi-year"], years: [2013, 2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Bourbon Street", company: "Bourbon Street", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "bourbonstreetfullerton.com", address: "Downtown Fullerton, CA", notes: "Southern-inspired cuisine. Multi-year vendor (2013, 2018).", activities: [], tags: ["southern", "food", "multi-year", "downtown"], years: [2013, 2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // 2018 Vendors
    { id: vid(), name: "The Cellar", company: "The Cellar", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "305 N Harbor Blvd, Fullerton, CA", notes: "Fine French dining. Iconic Fullerton restaurant.", activities: [], tags: ["fine-dining", "french", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Collette's Catering", company: "Collette's Catering", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "colettesevents.com", address: "1568 Kimberly Ave, Fullerton, CA", notes: "Catering service.", activities: [], tags: ["catering", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "D'Vine", company: "D'Vine", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant vendor.", activities: [], tags: ["restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Farrell's", company: "Farrell's", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant vendor.", activities: [], tags: ["restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Florentine's", company: "Florentine's", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant.", activities: [], tags: ["italian", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "The Twisted Vine", company: "The Twisted Vine", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "twistedvinewines.com", address: "127 W Commonwealth Ave, Fullerton, CA", notes: "Wine bar and restaurant.", activities: [], tags: ["wine-bar", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Roscoe's", company: "Roscoe's", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Downtown Fullerton, CA", notes: "Famous deli. Handcrafted sandwiches & craft cocktails.", activities: [], tags: ["deli", "sandwiches", "food", "downtown"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Nothing Bundt Cakes", company: "Nothing Bundt Cakes", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Bakery and desserts.", activities: [], tags: ["bakery", "desserts", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "The Public House", company: "The Public House", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Restaurant and bar.", activities: [], tags: ["bar", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Mulberry Street", company: "Mulberry Street", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "114 W Wilshire Ave, Fullerton, CA", notes: "Italian restaurant.", activities: [], tags: ["italian", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Brownstone Cafe", company: "Brownstone Cafe", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Cafe and restaurant.", activities: [], tags: ["cafe", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "The Olde Ship", company: "The Olde Ship", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "British pub. Ranked #6 of 244 Fullerton restaurants on TripAdvisor.", activities: [], tags: ["british-pub", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Bruxie", company: "Bruxie", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Waffle sandwiches.", activities: [], tags: ["waffles", "sandwiches", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Ziings", company: "Ziings", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "209 N Harbor Blvd, Fullerton, CA", notes: "Bar.", activities: [], tags: ["bar", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Les Amis", company: "Les Amis", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "lesamisfullerton.com", address: "Fullerton, CA", notes: "Lebanese/Middle Eastern restaurant.", activities: [], tags: ["lebanese", "middle-eastern", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Alza Osteria", company: "Alza Osteria", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant.", activities: [], tags: ["italian", "restaurant", "food"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Cafe Hidalgo", company: "Hidalgo's Cocina & Cocteles", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "hidalgofullerton.com", address: "305 N Harbor Blvd #111, Fullerton, CA", notes: "Modern Southwest cuisine. Owner/Chef Mike Oates, longtime Uncorked participant.", activities: [], tags: ["southwest", "mexican", "food", "multi-year"], years: [2018], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Gina Maria's", company: "Gina Maria's", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "food", website: "", address: "Fullerton, CA", notes: "Italian restaurant. Referenced on fullertonsouthrotary.com.", activities: [], tags: ["italian", "restaurant", "food"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // === BEER VENDORS ===
    { id: vid(), name: "The Bruery", company: "The Bruery", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "thebruery.com", address: "Placentia, CA", notes: "Craft brewery. Featured in beer garden.", activities: [], tags: ["craft-brewery", "beer-garden"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Towne Park Brewery & Taproom", company: "Towne Park Brewery & Taproom", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "towneparkbrew.com", address: "Anaheim, CA", notes: "Craft brewery. Beer garden vendor.", activities: [], tags: ["craft-brewery", "beer-garden"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "TAPS Fish House & Brewery", company: "TAPS Fish House & Brewery", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "tapsfishhouse.com", address: "Brea, CA", notes: "Craft brewery and restaurant.", activities: [], tags: ["craft-brewery", "restaurant", "beer-garden"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Bootlegger's Brewery", company: "Bootlegger's Brewery", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "bootleggers.beer", address: "130 S Highland Ave, Fullerton, CA", notes: "Fullerton's first production brewery, opened April 2008. Up to 30 styles on tap.", activities: [], tags: ["craft-brewery", "beer-garden", "local-fullerton"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Fullerton Brew Company", company: "Fullerton Brew Company", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "fullertonbrewco.com", address: "Fullerton, CA", notes: "Local Fullerton craft brewery.", activities: [], tags: ["craft-brewery", "beer-garden", "local-fullerton"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Hoparazzi Brewing Company", company: "Hoparazzi Brewing Company", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "", address: "Fullerton, CA", notes: "Local craft brewery.", activities: [], tags: ["craft-brewery", "beer-garden"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Abita Brewery", company: "Abita Brewery", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "abita.com", address: "Louisiana", notes: "Brewery. 2013 vendor.", activities: [], tags: ["brewery", "beer-garden"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Hangar 24 Brewery", company: "Hangar 24 Brewery", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "beer", website: "hangar24brewing.com", address: "Redlands, CA", notes: "Craft brewery. 2013 vendor.", activities: [], tags: ["craft-brewery", "beer-garden"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // === ENTERTAINMENT ===
    { id: vid(), name: "Pulp Vixen", company: "Pulp Vixen", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "entertainment", website: "pulpvixenband.com", address: "Corona, CA", notes: "90s tribute cover band. Established 2009. IE Magazine favorite band 4 years running.", activities: [], tags: ["band", "cover-band", "90s", "entertainment"], years: [2023, 2024], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "Grooveline", company: "Grooveline", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "entertainment", website: "", address: "", notes: "Cover/party band.", activities: [], tags: ["band", "cover-band", "entertainment"], years: [2022, 2023], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
    { id: vid(), name: "The Spazmatics", company: "The Spazmatics", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "entertainment", website: "", address: "", notes: "80s tribute cover band. Popular SoCal cover band.", activities: [], tags: ["band", "cover-band", "80s", "entertainment"], years: [2018, 2019], assignedTo: "Unassigned", createdAt: now, updatedAt: now },

    // === SERVICES ===
    { id: vid(), name: "Jewelry Station Gals", company: "Jewelry Station Gals", email: "", phone: "", type: "potential_vendor", status: "lead", vendorCategory: "services", website: "", address: "", notes: "Artisan vendor. Decorated wine bottles and fashionable trinkets.", activities: [], tags: ["artisan", "jewelry", "services"], years: [2013], assignedTo: "Unassigned", createdAt: now, updatedAt: now },
  ];
}

// ============================================
// Seed Meeting Notes from ClickUp
// ============================================
function getDefaultMeetings(): Meeting[] {
  return [
    {
      id: "mtg_1",
      title: "Fun Committee Meeting",
      date: "2025-10-06",
      time: "12:00",
      attendees: ["Leslie McCarthy", "Miko Krisvoy", "Monica Fernandez", "Howard Minkley", "Cathy Gach", "Judy Atwell", "Sally Williams", "Brett Ackerman", "Dustin Cole"],
      notes: `## Pumpkin Run\n- Dan O (through Cathy) reminder about membership drive / club expense\n- Doing a booth\n\n## Halloween Event Planning\n- Sally has decorations\n- Leslie giving Dustin stuff for photo booth\n- Dessert: Zombie donuts\n- Costume contest — Miko and Cathy to judge\n- Prizes: Miko prepared 3 items; Cathy getting scary wine from Twisted Vine\n- Games: Ring toss (Dustin to buy), Bingo with prizes\n\n## Christmas Plans\n- No Santa\n- Dustin handles music\n- $65/person\n- Zeffy campaign on Foundation\n- Flyer needed\n\n## Next Meeting\n- November after the 10th`,
      actionItems: [
        { id: "ai_1_1", text: "Give headcount to Trish a week prior", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-22" },
        { id: "ai_1_2", text: "Print bingo papers, bring photo booth items", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-29" },
        { id: "ai_1_3", text: "Buy witch ring toss game", assignee: "Dustin Cole", completed: true, dueDate: "2025-10-15" },
      ],
      category: "general",
      createdAt: "2025-10-06T19:00:00.000Z",
      updatedAt: "2025-10-06T19:00:00.000Z",
    },
    {
      id: "mtg_2",
      title: "Fun Committee Meeting",
      date: "2025-11-13",
      time: "18:00",
      attendees: ["Leslie McCarthy", "Miko Krisvoy", "Monica Fernandez", "Howard Minkley", "Cathy Gach", "Judy Atwell", "Sally Williams", "Brett Ackerman", "Dustin Cole"],
      notes: `## Review of Halloween Event\n- General response very positive\n- Venue, activities, vibes all good\n\n## Zeffy\n- Look into if Zeffy can capture guest contact info\n- Few people use Zelle; most write checks\n- Registration still needs to get done\n\n## Christmas Party\n- 10am entrance for decorating\n- Same food and drinks as last year\n- Music — something weird with Bluetooth speaker last time\n- Photo booth (Dustin). Sally to bring props.\n- Originally scheduled Dec 3 but most want to change date (too early)\n- Flyer needed for this weekend\n- $65 per head, minus $25 for members (because of lunch)\n- Gifts go to 17-and-under nonprofit members (Boys and Girls Club and Crittenton)\n- Activities: Karaoke (Lana might have machine), Ugly Sweater contest\n\n## Demotion Night\n- 4th Wednesday in June\n- Convention in Taiwan June 13-17\n\n## Spring Event Ideas (March/April)\n- People miss the mystery night events\n- Past events: Medieval Times, Hollywood Bowl, train to San Diego\n- New ideas: San Antonio Winery, Glow-in-the-dark golf, Pitch and Putt / Camelot miniature golf\n- Can charge $10 over cost for charitable giving, get a food truck\n- Everyone liked it — affordable, good for kids`,
      actionItems: [
        { id: "ai_2_1", text: "Wait for solid date from Leslie for Christmas event", assignee: "Dustin Cole", completed: true },
        { id: "ai_2_2", text: "Setup Zeffy Campaign for Christmas event", assignee: "Dustin Cole", completed: true, dueDate: "2025-11-18" },
      ],
      category: "general",
      createdAt: "2025-11-13T02:00:00.000Z",
      updatedAt: "2025-11-13T02:00:00.000Z",
    },
    {
      id: "mtg_3",
      title: "Fullerton Uncorked Committee Meeting",
      date: "2026-01-23",
      time: "12:00",
      attendees: ["Jordan Garcia", "Dustin Cole", "Dan Ouweleen", "Kevin", "Patrick Hartnett", "Jim Williams"],
      notes: `## Event Date Confirmed\n- **October 10, 2026** (Saturday)\n- Avoids conflicts with Taste of the Town, Boys and Girls Club, and other events\n- Early entry 5:00-5:30 PM for sponsors; general entry shortly after\n\n## Ticket Pricing\n- Maintained at $95 regular / $125 early entry (VIP)\n- No price increases\n\n## Venue\n- Capacity up to 500 people\n\n## Meeting Schedule\n- Moved to 3rd Friday of each month\n- Next meeting: February 20\n\n## Sponsors\n- $5,000 sponsor check from Mike Oates confirmed\n\n## Event Differentiation\n- Focus on securing upscale restaurants to differentiate from Taste of the Town\n- Use public records and direct engagement for vendor outreach`,
      actionItems: [
        { id: "ai_3_1", text: "Update event website with new details, enable e-ticketing", assignee: "Dustin Cole", completed: false, dueDate: "2026-02-01" },
        { id: "ai_3_2", text: "Send save-the-date via email and social media once website updated", assignee: "Amy Choi-Wan", completed: false, dueDate: "2026-02-15" },
        { id: "ai_3_3", text: "Finalize vendor packets, distribute by 02/15", assignee: "Jordan Garcia", completed: false, dueDate: "2026-02-15" },
        { id: "ai_3_4", text: "Compile hit list of local restaurants, begin vendor outreach", assignee: "Dan Ouweleen", completed: false, dueDate: "2026-02-20" },
        { id: "ai_3_5", text: "Investigate e-ticketing solutions (unique links, QR codes)", assignee: "Dustin Cole", completed: false, dueDate: "2026-02-20" },
        { id: "ai_3_6", text: "Confirm next meeting for Feb 20", assignee: "Jordan Garcia", completed: true },
        { id: "ai_3_7", text: "Follow up with sponsors, update sponsor package materials", assignee: "Unassigned", completed: false },
      ],
      category: "planning",
      createdAt: "2026-01-23T20:00:00.000Z",
      updatedAt: "2026-01-23T20:00:00.000Z",
    },
    {
      id: "mtg_4",
      title: "Givsum Set-up Meeting",
      date: "2026-01-30",
      time: "12:00",
      attendees: ["Dustin Cole", "Dan Ouweleen", "Jordan Garcia"],
      notes: `## E-Ticketing\n- Adopting e-ticket system (Leslie specified preference for e-tickets)\n- Eliminated redundant member general admission ticket\n- VIP (early access) at $125; general at $95\n- Ticket transfers allowed with manual administrative oversight\n- Barcode scanning planned for check-in\n\n## Sponsorships\n- Details kept on site for advertising\n- Actual transactions not through Givsum\n\n## Other Ideas\n- LinkedIn page should be created\n- Should sell tickets at the door\n- Should sell early bird ticket prices\n- VIP Early Access Tickets\n- Explore enhanced online marketing strategy (possibly hire Amy Scruggs for digital marketing)\n- Investigate integrating survey feature into ticketing system\n\n## Platform Notes\n- Givsum/Gibson supports event details, social links, donation setups, barcode generation, and volunteer sign-ups`,
      actionItems: [
        { id: "ai_4_1", text: "Arrange full committee review of website verbiage at next meeting", assignee: "Jordan Garcia", completed: false, dueDate: "2026-02-20" },
        { id: "ai_4_2", text: "Continue updating Fullerton Uncorked website, converting vendor/food/sponsor entries into CMS tables", assignee: "Dustin Cole", completed: false },
        { id: "ai_4_3", text: "Follow up with Sean about ticket transfer mechanism and barcode scanner", assignee: "Dan Ouweleen", completed: false },
        { id: "ai_4_4", text: "Fix email invitation (update Jordan's email to jgarcia@ymca.org)", assignee: "Dan Ouweleen", completed: false },
      ],
      category: "logistics",
      createdAt: "2026-01-30T20:00:00.000Z",
      updatedAt: "2026-01-30T20:00:00.000Z",
    },
    {
      id: "mtg_5",
      title: "Uncorked Committee Meeting",
      date: "2026-02-27",
      time: "12:00",
      attendees: ["Jordan Garcia", "Dan Ouweleen", "Leslie McCarthy", "Dustin Cole", "Brett Ackerman", "Monica Fernandez", "Jim Williams"],
      notes: `## Venue Discussion\n- Cal State Fullerton — no go, too much red tape\n- Fullerton College — was not a good host in the past\n- Coyote Hills — only available Sundays; availability/cost are factors\n- Thinking of moving to **August** (October is new primary wedding season)\n- YMCA Crab Fest is Sept (Jordan's fundraiser)\n- Lot next to Boys and Girls Club — proposed by Brett\n- The Charleston — could work but $15k cost\n- Muckenthaler — booked Sept/Oct\n- Coyote Hills Ranch gala possible (their gala is the 4th, could do week after but would butt against sunrise club; it's in the dirt)\n- **Best bet is the Muck** — Farrel could work with us\n- **Fullerton Plaza** — done through city, ~$3.5k for staffing/cleaning/space/deposit; goes through Fullerton Museum; part of funds go to museum; they have insurance; negotiable; hard to keep space secure\n\n## Entertainment\n- Everyone really wants a **live band** (Muck has good bands)\n\n## Outreach\n- Outreach to vendors and sponsors needed\n- Vendor list will go out; need to show last year's vendors\n\n## Responsibilities\n- **Vendors**: Leslie and Jim in charge\n- **Sponsors**: No sponsorship team yet\n\n## Budget\n- Jordan and Leslie will work on a budget\n\n## Website Ideas\n- Monica recommends putting last year's photos on website to advertise\n- Website can have a chatbot, calendar invite system, and other AI tools`,
      actionItems: [
        { id: "ai_5_1", text: "Follow up with Farrel at Muckenthaler about venue availability", assignee: "Jordan Garcia", completed: false },
        { id: "ai_5_2", text: "Research Fullerton Plaza availability and costs through city/museum", assignee: "Jordan Garcia", completed: false },
        { id: "ai_5_3", text: "Send out vendor list showing last year's vendors", assignee: "Leslie McCarthy", completed: false },
        { id: "ai_5_4", text: "Work on event budget draft", assignee: "Jordan Garcia", completed: false },
        { id: "ai_5_5", text: "Put last year's photos on website", assignee: "Dustin Cole", completed: false },
        { id: "ai_5_6", text: "Form a sponsorship outreach team", assignee: "Unassigned", completed: false },
      ],
      category: "planning",
      createdAt: "2026-02-27T20:00:00.000Z",
      updatedAt: "2026-02-27T20:00:00.000Z",
    },
  ];
}
