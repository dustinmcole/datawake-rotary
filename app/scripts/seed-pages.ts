/**
 * Seed script for CMS pages.
 *
 * Usage:
 *   cd app && npx tsx scripts/seed-pages.ts
 *
 * Requires DATABASE_URL environment variable.
 * Will NOT overwrite existing pages — only inserts if slug doesn't exist.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { pages } from "../src/lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 30; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const SEED_PAGES = [
  {
    slug: "home",
    title: "Home",
    metaDescription:
      "The Rotary Club of Fullerton — serving the community since 1924. Service Above Self.",
    content: `# Welcome to Fullerton Rotary

The Rotary Club of Fullerton has been a pillar of the community since 1924. As one of the oldest and most active clubs in District 5320, we bring together business and community leaders dedicated to making a difference.

## Service Above Self

Our members are guided by the Rotary motto "Service Above Self" and the Four-Way Test. Together, we support youth programs, serve seniors and families, contribute to international projects, and foster vocational excellence.

## By the Numbers

- **100+ years** of continuous service
- **300+ members** strong
- **$1.3M+** in total charitable donations
- **100+ nonprofits** supported

## Join Us

We meet every Wednesday from 12:00 PM to 1:30 PM at Coyote Hills Country Club. Guests are always welcome.
`,
  },
  {
    slug: "about",
    title: "About Us",
    metaDescription:
      "Learn about the Rotary Club of Fullerton — our history, mission, leadership, and the Four-Way Test.",
    content: `# About the Rotary Club of Fullerton

## A Century of Service

The Rotary Club of Fullerton was chartered in 1924 and has been serving the Fullerton community for over 100 years. We are one of the most active clubs in Rotary District 5320, which spans Southern California.

Rotary International is the world's first service club organization, founded in 1905 by Paul Harris in Chicago. Today, Rotary connects over 1.4 million members across more than 46,000 clubs in 200+ countries and geographic areas.

## The Four-Way Test

Of the things we think, say or do:

1. Is it the **TRUTH**?
2. Is it **FAIR** to all concerned?
3. Will it build **GOODWILL** and **BETTER FRIENDSHIPS**?
4. Will it be **BENEFICIAL** to all concerned?

## Our Mission

The Rotary Club of Fullerton focuses on:

- **Community Service** — Supporting Fullerton families, seniors, schools, and nonprofits
- **Youth Development** — Interact, Rotaract, Youth Exchange, RYLA, and scholarships
- **International Service** — Global projects through The Rotary Foundation
- **Vocational Excellence** — Career mentorship and ethics programs

## Weekly Meeting

- **When:** Every Wednesday, 12:00 PM – 1:30 PM
- **Where:** Coyote Hills Country Club, 1440 E Bastanchury Rd, Fullerton, CA 92835
- **Guests:** Always welcome! Arrive a few minutes early.

## District 5320

We are part of Rotary District 5320, covering clubs across Southern California. Our district supports clubs with training, grants, and coordination for service projects.
`,
  },
  {
    slug: "programs",
    title: "Programs & Service",
    metaDescription:
      "Explore Fullerton Rotary's community service, youth programs, international projects, and vocational service initiatives.",
    content: `# Programs & Service

The Rotary Club of Fullerton runs a diverse portfolio of programs serving our local community and the world.

## Community Service

Our members volunteer on hands-on service projects throughout the year:

- Holiday food drives and gift programs
- Park cleanups and beautification projects
- Scholarships for Fullerton students
- Partnerships with Boys & Girls Club
- Support for Fullerton Interfaith Emergency Services (FIES)
- Collaboration with Pathways of Hope

## Youth Programs

Investing in the next generation of leaders:

- **Interact Club** — High school service club sponsored by our club
- **Rotaract** — Young adults ages 18-30 focused on service and leadership
- **Youth Exchange** — International student exchange promoting peace and understanding
- **RYLA** — Rotary Youth Leadership Awards camp for high school juniors and seniors
- **Scholarships** — Annual awards for outstanding Fullerton students

## International Service

Through The Rotary Foundation, we contribute to global projects:

- **PolioPlus** — Rotary's flagship initiative to eradicate polio worldwide
- Clean water and sanitation projects
- Disaster relief and recovery
- Global grants for sustainable community development

## Vocational Service

Promoting ethics and professional development:

- Career mentorship for students
- Ethics Day at local high schools
- Vocational training grants
- Classification talks sharing professional expertise

## The Rotary Foundation

The Rotary Foundation is one of the world's largest and most highly rated private foundations. Our club proudly contributes to the Annual Fund, PolioPlus, and the Endowment Fund, with many members recognized as Paul Harris Fellows.
`,
  },
  {
    slug: "events",
    title: "Events",
    metaDescription:
      "Upcoming events from the Rotary Club of Fullerton — meetings, service projects, fundraisers, and social gatherings.",
    content: `# Events

Stay connected with Fullerton Rotary through our regular meetings, service projects, fundraisers, and social events.

## Weekly Meetings

Join us every Wednesday from 12:00 PM to 1:30 PM at Coyote Hills Country Club. Our meetings feature guest speakers, fellowship, and club business. Guests are always welcome.

## Fullerton Uncorked

Our signature annual fundraiser — a wine, beer, and food tasting event benefiting local nonprofits. Visit our Uncorked page for details.

## Service Projects

Throughout the year, we organize hands-on service projects in the Fullerton community. All members and guests are invited to participate.

Check back here for upcoming events, or contact us for more information.
`,
  },
  {
    slug: "join",
    title: "Join Fullerton Rotary",
    metaDescription:
      "Interested in joining the Rotary Club of Fullerton? Learn about membership benefits and submit an inquiry.",
    content: `# Join Fullerton Rotary

Rotary membership connects you with a global network of leaders dedicated to making a difference.

## Why Join?

- **Networking & Fellowship** — Build lasting relationships with business and community leaders
- **Community Impact** — Participate in meaningful service projects
- **Leadership Development** — Grow your skills through committee work and leadership roles
- **Global Connections** — Be part of 1.4 million Rotarians in 200+ countries
- **Personal Growth** — Develop professionally and personally through service

## How Membership Works

Rotary clubs use a classification system to ensure diverse professional representation. Each member represents a distinct business or professional classification (e.g., Banking, Education, Healthcare, Law, Real Estate).

New members are sponsored by a current member and approved by the club's membership committee. If you don't know a current member, that's OK — submit an inquiry and we'll connect you.

## What to Expect

- **Weekly Meetings:** Wednesdays, 12:00 PM – 1:30 PM at Coyote Hills Country Club
- **Service Projects:** Optional but encouraged — this is where the fun is!
- **Committees:** Join one or more committees aligned with your interests
- **Events:** Social gatherings, fundraisers, and fellowship opportunities

## Ready to Join?

Fill out the membership inquiry form on this page, and our membership committee will reach out within a few business days.
`,
  },
  {
    slug: "contact",
    title: "Contact Us",
    metaDescription:
      "Contact the Rotary Club of Fullerton — meeting information, location, and how to reach us.",
    content: `# Contact Us

We'd love to hear from you.

## Meeting Location

**Coyote Hills Country Club**
1440 E Bastanchury Rd
Fullerton, CA 92835

## Meeting Times

Every Wednesday, 12:00 PM – 1:30 PM
Guests are always welcome.

## Email

info@fullertonrotaryclub.com

## Membership Inquiries

Interested in joining? Visit our Join page to submit a membership inquiry.

## Rotary International

- Rotary International: www.rotary.org
- District 5320: district5320.org
- Find a Club: my.rotary.org/en/search/club-finder
`,
  },
  {
    slug: "uncorked",
    title: "Fullerton Uncorked",
    metaDescription:
      "Fullerton Uncorked — the Rotary Club of Fullerton's annual wine, beer, and food tasting fundraiser.",
    content: `# Fullerton Uncorked

## Wine, Beer & Food Tasting Fundraiser

Fullerton Uncorked is the Rotary Club of Fullerton's signature annual fundraiser — an evening celebration featuring fine wine, craft beer, and culinary bites from local artisans.

## Event Details

- **Date:** October 17, 2026
- **Time:** 5:00 PM – 9:00 PM
- **Venue:** Fullerton Family YMCA, 201 S Basque Ave, Fullerton, CA 92832
- **Tickets:** Presale only — no door sales

## Our Impact

All proceeds benefit the Fullerton Rotary Foundation, supporting local nonprofits, youth programs, and community service projects. To date, the Rotary Club of Fullerton has donated over $1.3 million to charitable causes.

## Learn More

Visit fullertonuncorked.org for tickets, sponsor information, and event updates.
`,
  },
];

async function seed() {
  console.log("Seeding CMS pages...\n");

  let created = 0;
  let skipped = 0;

  for (const pageData of SEED_PAGES) {
    // Check if page already exists
    const existing = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, pageData.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  SKIP: /${pageData.slug} (already exists)`);
      skipped++;
      continue;
    }

    await db.insert(pages).values({
      id: generateId(),
      slug: pageData.slug,
      title: pageData.title,
      content: pageData.content,
      metaDescription: pageData.metaDescription,
      published: true,
      version: 1,
    });

    console.log(`  CREATE: /${pageData.slug} — "${pageData.title}"`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
