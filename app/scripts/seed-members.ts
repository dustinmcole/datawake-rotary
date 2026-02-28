/**
 * Seed script — imports Fullerton Rotary Club members from DACDB data.
 *
 * Source: DACDB Club #828, Active/Honorary Members tab, scraped 2026-02-28.
 * 103 members total: 87 Active, 7 Active-Corporate, 9 Honorary.
 *
 * Usage:
 *   cd app
 *   export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2-)
 *   npx tsx scripts/seed-members.ts
 *
 * Safe to re-run — uses onConflictDoNothing on primary key (dacdb_<id>).
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is required. Export it first:");
  console.error("   export DATABASE_URL=$(grep '^DATABASE_URL=' .env.local | cut -d'=' -f2-)");
  process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client);

// ---------------------------------------------------------------------------
// Role assignments based on DACDB club positions
// ---------------------------------------------------------------------------
const OFFICER_ROLES: Record<string, string[]> = {
  "5618865":  ["member", "club_admin", "board_member"], // Leslie McCarthy — President
  "6762258":  ["member", "club_admin", "board_member"], // Patrick Michael Hartnett — President-Elect
  "11358615": ["member", "club_admin"],                 // Carol Louise Morris — Secretary
  "6684986":  ["member", "club_admin"],                 // Daniel R. Ouweleen — Club Admin Chair / Exec Secretary
  "2478881":  ["member", "board_member"],               // Catherine Gach — Treasurer / iPast President
  "6377896":  ["member", "board_member"],               // Theresa Harvey — Treasurer
  "1397081":  ["member", "board_member"],               // Joyce R. Capelle — Club Foundation President
  "8161691":  ["member", "board_member", "committee_chair"], // Howard Minkley — Club Director
  "9717764":  ["member", "board_member"],               // James Ripley — Past President
  "11190485": ["member", "committee_chair"],            // Andrew W. Gregson — Vocational Service Chair
  "12054660": ["member", "committee_chair"],            // Richard Fair — Youth Service Chair
  "1248416":  ["member", "committee_chair"],            // William Allen Edman — Club Service Chair
  "6068597":  ["member", "committee_chair"],            // Randall P McFarland — Club Service Chair
  "1047771":  ["member", "committee_chair"],            // William L Christensen — Sergeant-at-Arms
  "9095999":  ["member", "committee_chair"],            // Monica Fernandez — International Service Chair
};

// ---------------------------------------------------------------------------
// Phone selection: cell > office > home, skip "(private)" / blank
// ---------------------------------------------------------------------------
function bestPhone(home: string, office: string, cell: string): string {
  const clean = (s: string) =>
    s.toLowerCase().includes("private") || s.trim() === "" ? "" : s.trim();
  return clean(cell) || clean(office) || clean(home);
}

// ---------------------------------------------------------------------------
// Member data — 103 members from DACDB Club #828
// ---------------------------------------------------------------------------
type DacdbRow = {
  dacdbId: string;
  firstName: string;
  lastName: string;
  email: string;
  home: string;
  office: string;
  cell: string;
  memberType: "active" | "honorary";
};

const MEMBERS: DacdbRow[] = [
  { dacdbId: "8791436",  firstName: "Brett",           lastName: "Ackerman",      email: "backerman@boysgirlsfullerton.com",    home: "",               office: "",               cell: "",               memberType: "active" },
  { dacdbId: "389267",   firstName: "Richard C.",      lastName: "Ackerman",      email: "dickackerman33@gmail.com",           home: "",               office: "(714) 322-2710", cell: "",               memberType: "active" },
  { dacdbId: "8227609",  firstName: "Joe",             lastName: "Arnold",        email: "JArnold@fullerton.edu",              home: "(714) 524-9716", office: "(714) 524-9716", cell: "(714) 515-9170", memberType: "active" },
  { dacdbId: "8161681",  firstName: "Judy",            lastName: "Atwell",        email: "AAtwell925@aol.com",                 home: "(714) 879-9466", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "8161687",  firstName: "Kim",             lastName: "Barlow",        email: "khb@jones-mayer.com",                home: "",               office: "(714) 446-1400", cell: "",               memberType: "active" },
  { dacdbId: "12470724", firstName: "Brian",           lastName: "Bates",         email: "brian@trustbatescpa.com",            home: "(949) 463-7611", office: "(949) 449-3313", cell: "(949) 463-7611", memberType: "active" },
  { dacdbId: "389152",   firstName: "David L.",        lastName: "Bates",         email: "bates4golf@att.net",                 home: "(949) 287-6935", office: "(714) 871-2422", cell: "(714) 742-1648", memberType: "active" },
  { dacdbId: "1139044",  firstName: "Larry",           lastName: "Bennett",       email: "Larry@bennettfis.com",               home: "(714) 449-1629", office: "(714) 854-0455", cell: "",               memberType: "active" },
  { dacdbId: "389148",   firstName: "Allan L.",        lastName: "Bridgford",     email: "Abridgford@bridgford.com",           home: "(714) 879-8798", office: "(714) 526-5533", cell: "",               memberType: "honorary" },
  { dacdbId: "12502363", firstName: "Antoinette",      lastName: "Brown",         email: "theantbrown@att.net",                home: "",               office: "",               cell: "(714) 356-6787", memberType: "active" },
  { dacdbId: "6848499",  firstName: "Marty",           lastName: "Burbank",       email: "Marty@OCElderLaw.com",               home: "(714) 425-9061", office: "(800) 220-4205", cell: "(714) 425-9061", memberType: "active" },
  { dacdbId: "12160254", firstName: "Jon W.",          lastName: "Caffrey",       email: "caffreyfamily6@gmail.com",           home: "(562) 217-9088", office: "(714) 626-3801", cell: "(562) 217-9088", memberType: "active" },
  { dacdbId: "1057948",  firstName: "Carl",            lastName: "Camp",          email: "five2jughead@gmail.com",             home: "(714) 525-3373", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "1397081",  firstName: "Joyce R.",        lastName: "Capelle",       email: "capelle1954@gmail.com",              home: "(714) 328-1277", office: "",               cell: "(714) 328-1277", memberType: "active" },
  { dacdbId: "10019722", firstName: "Sueling",         lastName: "Chen",          email: "DrChen@Arborland.com",               home: "",               office: "(714) 879-3111", cell: "(714) 335-0140", memberType: "active" },
  { dacdbId: "11786303", firstName: "Amy",             lastName: "Choi-Won",      email: "amy.choiwon@gmail.com",              home: "",               office: "",               cell: "(714) 267-9351", memberType: "active" },
  { dacdbId: "1047771",  firstName: "William L.",      lastName: "Christensen",   email: "ChristensenWL@ATT.net",              home: "(714) 990-6860", office: "",               cell: "(714) 917-7144", memberType: "active" },
  { dacdbId: "9095881",  firstName: "Mike",            lastName: "Cochran",       email: "jmcochran76@gmail.com",              home: "(714) 469-7016", office: "",               cell: "(714) 469-7016", memberType: "active" },
  { dacdbId: "12160251", firstName: "Dustin",          lastName: "Cole",          email: "dustin.cole@datawakepartners.com",   home: "",               office: "(858) 245-8513", cell: "(858) 245-8513", memberType: "active" },
  { dacdbId: "1804280",  firstName: "Richard J. Jr.",  lastName: "Crane",         email: "rcrane@cranearchitecturalgrp.com",   home: "(714) 992-6989", office: "(714) 525-0363", cell: "(714) 271-8677", memberType: "active" },
  { dacdbId: "6870081",  firstName: "Andy",            lastName: "Diaz",          email: "adiaz@fundraisewithfood.com",        home: "(714) 871-7444", office: "(562) 694-2301", cell: "",               memberType: "honorary" },
  { dacdbId: "8293347",  firstName: "Tuan",            lastName: "Do",            email: "tuan.do@godtc.com",                  home: "(private)",      office: "(private)",      cell: "(private)",      memberType: "active" },
  { dacdbId: "2327690",  firstName: "Robert V.",       lastName: "Dolan",         email: "RVDolan@gmail.com",                  home: "(714) 803-0410", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "2421631",  firstName: "Scott",           lastName: "Dowds",         email: "",                                   home: "(714) 848-5600", office: "(714) 578-1945", cell: "(562) 577-1562", memberType: "active" },
  { dacdbId: "5307404",  firstName: "Thomas",          lastName: "Duarte",        email: "",                                   home: "(private)",      office: "(private)",      cell: "(private)",      memberType: "active" },
  { dacdbId: "1248416",  firstName: "William Allen",   lastName: "Edman",         email: "billedmanbiz@gmail.com",             home: "",               office: "",               cell: "(714) 820-9349", memberType: "active" },
  { dacdbId: "12570026", firstName: "Helen",           lastName: "Eligio",        email: "Helen.Eligio@fmb.com",               home: "(714) 875-9682", office: "(714) 888-3102", cell: "(714) 330-7148", memberType: "active" },
  { dacdbId: "11994180", firstName: "Lana",            lastName: "Erlanson",      email: "LErlanson@RadiantFutures.org",       home: "",               office: "",               cell: "(949) 290-3824", memberType: "active" },
  { dacdbId: "12054660", firstName: "Richard",         lastName: "Fair",          email: "Ricky@FairHome.Info",                home: "",               office: "(719) 301-9526", cell: "(719) 331-1980", memberType: "active" },
  { dacdbId: "9095999",  firstName: "Monica",          lastName: "Fernandez",     email: "monica@fullertonhearing.com",        home: "",               office: "(714) 871-0632", cell: "(949) 677-9458", memberType: "active" },
  { dacdbId: "11524340", firstName: "Rebecka",         lastName: "Forrester",     email: "Rebecka.Forrester@me.com",           home: "(714) 412-5157", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "2478881",  firstName: "Catherine",       lastName: "Gach",          email: "CathyGach1@Gmail.com",               home: "(714) 488-0399", office: "",               cell: "(714) 488-0399", memberType: "active" },
  { dacdbId: "11733266", firstName: "Jordan",          lastName: "Garcia",        email: "jgarcia@ymcaoc.org",                 home: "",               office: "(714) 879-9622", cell: "(714) 883-1511", memberType: "active" },
  { dacdbId: "10495858", firstName: "Amy",             lastName: "Gaw",           email: "amyg@ocunited.org",                  home: "(714) 809-5324", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "10394992", firstName: "David",           lastName: "Gillanders",    email: "dgillanders@pohoc.org",              home: "",               office: "",               cell: "",               memberType: "active" },
  { dacdbId: "2348567",  firstName: "Terri",           lastName: "Grassi",        email: "Grassicpa@gmail.com",                home: "(562) 773-6269", office: "(714) 449-9696", cell: "(562) 773-6269", memberType: "active" },
  { dacdbId: "389270",   firstName: "Aaron",           lastName: "Gregg",         email: "probateacg@aol.com",                 home: "(714) 526-0204", office: "(714) 871-4200", cell: "(714) 396-1541", memberType: "active" },
  { dacdbId: "11190485", firstName: "Andrew W.",       lastName: "Gregson",       email: "awgregson@yahoo.com",                home: "",               office: "(714) 871-3100", cell: "(626) 695-0460", memberType: "active" },
  { dacdbId: "6762258",  firstName: "Patrick Michael", lastName: "Hartnett",      email: "PHartnett@HartnettLawGroup.com",     home: "",               office: "(714) 738-1156", cell: "(714) 356-0340", memberType: "active" },
  { dacdbId: "6377896",  firstName: "Theresa",         lastName: "Harvey",        email: "tharvey447@gmail.com",               home: "",               office: "",               cell: "(714) 323-1975", memberType: "active" },
  { dacdbId: "389208",   firstName: "Roy",             lastName: "Harvill",       email: "RHarvill1925@Hughes.net",            home: "",               office: "",               cell: "",               memberType: "honorary" },
  { dacdbId: "10425772", firstName: "Timothy Earl",    lastName: "Hedrick",       email: "",                                   home: "(714) 321-2631", office: "(714) 526-2240", cell: "(714) 321-2631", memberType: "active" },
  { dacdbId: "10043697", firstName: "Farrell",         lastName: "Hirsch",        email: "Farrell@TheMuck.org",                home: "",               office: "(323) 833-9347", cell: "(323) 833-9347", memberType: "active" },
  { dacdbId: "5293593",  firstName: "William",         lastName: "Hite",          email: "bhite632@me.com",                    home: "(714) 525-6244", office: "(909) 355-1200", cell: "",               memberType: "active" },
  { dacdbId: "11291841", firstName: "Johny",           lastName: "Hong",          email: "john@retirementpro.us",              home: "",               office: "",               cell: "(714) 875-2086", memberType: "active" },
  { dacdbId: "11004624", firstName: "Matt",            lastName: "Howells",       email: "matt@Taraschance.org",               home: "",               office: "(714) 230-6247", cell: "(714) 403-1011", memberType: "active" },
  { dacdbId: "10425773", firstName: "Tim",             lastName: "Howells",       email: "timh@taraschance.org",               home: "",               office: "(714) 230-6247", cell: "(714) 401-2226", memberType: "active" },
  { dacdbId: "8777215",  firstName: "Frances",         lastName: "Hunter",        email: "FrancesMarieHunter@gmail.com",       home: "(714) 529-3542", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "389200",   firstName: "Royce L.",        lastName: "Hutain",        email: "",                                   home: "",               office: "",               cell: "",               memberType: "honorary" },
  { dacdbId: "848285",   firstName: "Jeffrey",         lastName: "Hutchison",     email: "jeffhutchison@shookbldg.com",        home: "(714) 773-4341", office: "(951) 685-2556", cell: "",               memberType: "active" },
  { dacdbId: "12152202", firstName: "Elizabeth S.",    lastName: "Jahncke",       email: "beth@jahncke.com",                   home: "",               office: "",               cell: "(714) 514-0555", memberType: "active" },
  { dacdbId: "1109038",  firstName: "Robert",          lastName: "Jahncke",       email: "Robert@Jahncke.com",                 home: "(714) 614-0555", office: "(714) 614-0555", cell: "(714) 614-0555", memberType: "active" },
  { dacdbId: "8048577",  firstName: "Robert",          lastName: "Jarvis",        email: "robert@paveit.com",                  home: "",               office: "",               cell: "(714) 240-4932", memberType: "active" },
  { dacdbId: "1303973",  firstName: "Kenneth",         lastName: "Kaisch",        email: "KenKaisch@Yahoo.com",                home: "(714) 390-0601", office: "",               cell: "(714) 390-0601", memberType: "active" },
  { dacdbId: "389198",   firstName: "Frank K.",        lastName: "Kawase",        email: "fkawase@sbcglobal.net",              home: "(714) 529-7634", office: "(714) 525-9779", cell: "(714) 915-7634", memberType: "active" },
  { dacdbId: "1303975",  firstName: "Daniel",          lastName: "Kiernan",       email: "dkDanAnnWine@Gmail.com",             home: "(714) 738-1767", office: "(714) 528-6991", cell: "",               memberType: "active" },
  { dacdbId: "389256",   firstName: "Tom",             lastName: "Knoll",         email: "tomknolljr@gmail.com",               home: "(714) 871-1967", office: "(714) 871-1967", cell: "(714) 608-7328", memberType: "active" },
  { dacdbId: "6213539",  firstName: "Jay G.",          lastName: "Kremer",        email: "JayKremer@msn.com",                  home: "(714) 529-4636", office: "",               cell: "(714) 322-7883", memberType: "honorary" },
  { dacdbId: "8042497",  firstName: "Miko",            lastName: "Krisvoy",       email: "krisvoyinteriors@gmail.com",         home: "(714) 879-9018", office: "(714) 447-4470", cell: "(714) 393-9018", memberType: "active" },
  { dacdbId: "8008426",  firstName: "Louis",           lastName: "Kuntz",         email: "louisail@sbcglobal.net",             home: "",               office: "",               cell: "(714) 404-1710", memberType: "active" },
  { dacdbId: "1248374",  firstName: "Allyn",           lastName: "Lean",          email: "allynlean@aol.com",                  home: "",               office: "",               cell: "",               memberType: "active" },
  { dacdbId: "11994166", firstName: "Mark",            lastName: "Lee",           email: "mlee@radiantfutures.org",            home: "",               office: "",               cell: "(714) 992-9105", memberType: "active" },
  { dacdbId: "8492373",  firstName: "Kenny J.",        lastName: "Lim",           email: "kenny.lim@fmb.com",                  home: "(714) 348-5277", office: "(714) 578-1945", cell: "(714) 235-8232", memberType: "active" },
  { dacdbId: "6136527",  firstName: "Joe",             lastName: "Lins",          email: "joelins@C21Discovery.com",           home: "",               office: "(714) 626-2069", cell: "(714) 390-5769", memberType: "active" },
  { dacdbId: "389274",   firstName: "George Jr.",      lastName: "Lowe",          email: "george@riteloom.com",                home: "",               office: "",               cell: "",               memberType: "active" },
  { dacdbId: "2578956",  firstName: "William",         lastName: "Mathy",         email: "wwmathy@aol.com",                    home: "(714) 879-5288", office: "(714) 535-1414", cell: "(714) 815-2165", memberType: "active" },
  { dacdbId: "5618865",  firstName: "Leslie",          lastName: "McCarthy",      email: "lesliemccarthy23@gmail.com",         home: "",               office: "(714) 577-5800", cell: "(714) 984-5497", memberType: "active" },
  { dacdbId: "12054675", firstName: "Don",             lastName: "McFarland",     email: "donmcf4@gmail.com",                  home: "",               office: "",               cell: "(714) 553-8851", memberType: "active" },
  { dacdbId: "6068597",  firstName: "Randall P.",      lastName: "McFarland",     email: "Randysunnyhills@gmail.com",          home: "(714) 693-9345", office: "(714) 738-4769", cell: "(714) 501-4006", memberType: "active" },
  { dacdbId: "11733303", firstName: "Steve",           lastName: "McLaughlin",    email: "smclaughlin@fjuhsd.org",             home: "",               office: "(714) 870-2801", cell: "(948) 485-1400", memberType: "active" },
  { dacdbId: "9850273",  firstName: "Travis J.",       lastName: "McShane",       email: "Travis@EclecticAssociates.com",      home: "",               office: "(657) 203-8364", cell: "(562) 217-3225", memberType: "active" },
  { dacdbId: "8161691",  firstName: "Howard",          lastName: "Minkley",       email: "HMinkley@msn.com",                   home: "(414) 916-9844", office: "",               cell: "(414) 916-9844", memberType: "active" },
  { dacdbId: "11783528", firstName: "Steven",          lastName: "Miyamoto",      email: "SAMiyamoto@Gmail.com",               home: "",               office: "",               cell: "(626) 234-9809", memberType: "active" },
  { dacdbId: "11358615", firstName: "Carol Louise",    lastName: "Morris",        email: "rotarysecretary828@gmail.com",       home: "",               office: "",               cell: "(585) 415-2250", memberType: "active" },
  { dacdbId: "389162",   firstName: "Charles A.",      lastName: "Munson",        email: "chuck@meg.cpa",                      home: "(714) 879-4078", office: "(714) 449-9909", cell: "",               memberType: "active" },
  { dacdbId: "8200941",  firstName: "Bob",             lastName: "Muschek",       email: "Bobmuschek1@AOL.com",                home: "(714) 526-2594", office: "",               cell: "(714) 393-0513", memberType: "active" },
  { dacdbId: "3333049",  firstName: "Mike S.",         lastName: "Oates",         email: "mikesoates@sbcglobal.net",           home: "(714) 871-6206", office: "",               cell: "(714) 975-4889", memberType: "active" },
  { dacdbId: "6684986",  firstName: "Daniel R.",       lastName: "Ouweleen",      email: "danrotary5320@gmail.com",            home: "",               office: "(714) 447-4478", cell: "(714) 742-6856", memberType: "active" },
  { dacdbId: "9434157",  firstName: "Susan H.",        lastName: "Ouweleen",      email: "susanhellis@gmail.com",              home: "(714) 725-9083", office: "(714) 535-1414", cell: "(714) 725-9083", memberType: "active" },
  { dacdbId: "1345280",  firstName: "William H.",      lastName: "Peloquin",      email: "",                                   home: "(714) 993-4751", office: "",               cell: "(714) 397-4518", memberType: "honorary" },
  { dacdbId: "12495240", firstName: "Wilma",           lastName: "Peloquin",      email: "wpeloquin@sbcglobal.net",            home: "",               office: "",               cell: "(714) 397-4518", memberType: "honorary" },
  { dacdbId: "986967",   firstName: "John W.",         lastName: "Phelps",        email: "johnwphelps@gmail.com",              home: "(714) 526-6325", office: "(714) 526-6325", cell: "",               memberType: "active" },
  { dacdbId: "8587298",  firstName: "Robert",          lastName: "Pletka",        email: "bob_pletka@fsd.k12.ca.us",           home: "",               office: "(714) 447-7410", cell: "(760) 688-6330", memberType: "active" },
  { dacdbId: "11011801", firstName: "Faisal M.",       lastName: "Qazi",          email: "fqazi@mac.com",                      home: "",               office: "909-267-7495",   cell: "909-373-6988",   memberType: "active" },
  { dacdbId: "1109029",  firstName: "Merlyn E.",       lastName: "Raco",          email: "racoimua@gmail.com",                 home: "",               office: "",               cell: "(310) 261-5902", memberType: "active" },
  { dacdbId: "8752822",  firstName: "Matthew",         lastName: "Reekstin",      email: "info@corept.net",                    home: "(714) 449-9965", office: "(714) 726-1973", cell: "(714) 726-1969", memberType: "active" },
  { dacdbId: "9717764",  firstName: "James",           lastName: "Ripley",        email: "jpr@raiwm.com",                      home: "",               office: "(714) 357-2477", cell: "(714) 357-2477", memberType: "active" },
  { dacdbId: "8439842",  firstName: "Thad",            lastName: "Sandford",      email: "sandfordt7@gmail.com",               home: "(714) 871-1422", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "389215",   firstName: "Robert A.",       lastName: "Sattler",       email: "bsattler@lee-associates.com",        home: "(714) 525-5510", office: "(714) 939-2123", cell: "(714) 553-8510", memberType: "active" },
  { dacdbId: "1879891",  firstName: "Philip E.",       lastName: "Silverman",     email: "SilvermanLaw@Yahoo.com",             home: "(714) 996-1606", office: "(714) 533-7731", cell: "",               memberType: "active" },
  { dacdbId: "10393954", firstName: "Daniel",          lastName: "Stewart",       email: "daniels@cdb-architects.com",         home: "",               office: "(657) 238-3000", cell: "(562) 256-0211", memberType: "active" },
  { dacdbId: "11993745", firstName: "Jin",             lastName: "Sung",          email: "",                                   home: "",               office: "",               cell: "(949) 923-8407", memberType: "active" },
  { dacdbId: "389201",   firstName: "James",           lastName: "Thompson",      email: "jimthompson@dc.rr.com",              home: "(310) 691-8593", office: "(714) 871-4353", cell: "",               memberType: "honorary" },
  { dacdbId: "11786390", firstName: "Randall",         lastName: "Tierney",       email: "Randall.Tierney@ParentingOC.com",    home: "",               office: "",               cell: "(626) 419-0269", memberType: "active" },
  { dacdbId: "2014504",  firstName: "Donald P.",       lastName: "Tormey",        email: "pat@tormey.us",                      home: "",               office: "",               cell: "",               memberType: "active" },
  { dacdbId: "0",        firstName: "Willa",           lastName: "Vanderburg",    email: "wmv1935@mac.com",                    home: "",               office: "",               cell: "",               memberType: "honorary" },
  { dacdbId: "11777300", firstName: "Craig",           lastName: "Weinreich",     email: "cweinreich@fjuhsd.org",              home: "",               office: "(714) 525-4200", cell: "(714) 406-4636", memberType: "active" },
  { dacdbId: "389231",   firstName: "Jimmy C.",        lastName: "Williams",      email: "jimwilliamsins@gmail.com",           home: "(private)",      office: "(private)",      cell: "(private)",      memberType: "active" },
  { dacdbId: "11905408", firstName: "Sally",           lastName: "Williams",      email: "MagicKodi@Gmail.com",                home: "",               office: "",               cell: "(714) 526-5588", memberType: "active" },
  { dacdbId: "389183",   firstName: "Warren B.",       lastName: "Wimer",         email: "Warren@Wwimer.com",                  home: "(714) 673-4086", office: "",               cell: "",               memberType: "active" },
  { dacdbId: "11786395", firstName: "Lisa",            lastName: "Wozab",         email: "lisa@awc-cwc.com",                   home: "",               office: "",               cell: "(714) 293-1200", memberType: "active" },
  { dacdbId: "12154891", firstName: "Douglas",         lastName: "Yost",          email: "dyost@crittentonsocal.org",          home: "",               office: "(714) 680-9000", cell: "(626) 862-2061", memberType: "active" },
  { dacdbId: "389184",   firstName: "Mark",            lastName: "Zane",          email: "MarkZane@AOL.com",                   home: "(714) 992-0998", office: "(714) 990-5400", cell: "",               memberType: "active" },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`🌱 Seeding ${MEMBERS.length} members from DACDB Club #828...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const m of MEMBERS) {
    const id = `dacdb_${m.dacdbId}`;
    const email = m.email.toLowerCase().trim() || `dacdb_${m.dacdbId}@noemail.local`;
    const phone = bestPhone(m.home, m.office, m.cell);
    const roles = JSON.stringify(OFFICER_ROLES[m.dacdbId] ?? ["member"]);

    try {
      const result = await db
        .insert(users)
        .values({
          id,
          clerkId: id,
          email,
          firstName: m.firstName,
          lastName: m.lastName,
          phone,
          memberType: m.memberType,
          status: "active",
          roles,
        })
        .onConflictDoNothing()
        .returning({ id: users.id });

      if (result.length > 0) {
        console.log(`  ✅ ${m.firstName} ${m.lastName}`);
        inserted++;
      } else {
        console.log(`  ⏭️  ${m.firstName} ${m.lastName} (already exists)`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ❌ ${m.firstName} ${m.lastName}:`, err);
    }
  }

  console.log(`\n✅ Done. Inserted: ${inserted}, Skipped: ${skipped}, Total: ${MEMBERS.length}`);

}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
