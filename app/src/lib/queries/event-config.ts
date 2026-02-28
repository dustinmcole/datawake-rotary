import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { eventConfig } from "@/lib/db/schema";

export type EventConfig = {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  ticketUrlGeneral: string;
  ticketUrlVip: string;
  priceGeneral: number;
  priceVip: number;
  heroImageUrl: string;
};

const DEFAULT_CONFIG: EventConfig = {
  eventName: "Fullerton Uncorked",
  eventDate: "2026-10-17",
  eventTime: "5:00 PM – 9:00 PM",
  venue: "Fullerton Family YMCA",
  venueAddress: "201 S Basque Ave, Fullerton, CA 92832",
  ticketUrlGeneral: "",
  ticketUrlVip: "",
  priceGeneral: 95,
  priceVip: 125,
  heroImageUrl: "",
};

function rowToConfig(row: typeof eventConfig.$inferSelect): EventConfig {
  return {
    eventName: row.eventName,
    eventDate: row.eventDate,
    eventTime: row.eventTime,
    venue: row.venue,
    venueAddress: row.venueAddress,
    ticketUrlGeneral: row.ticketUrlGeneral,
    ticketUrlVip: row.ticketUrlVip,
    priceGeneral: Number(row.priceGeneral),
    priceVip: Number(row.priceVip),
    heroImageUrl: row.heroImageUrl,
  };
}

export async function getEventConfig(): Promise<EventConfig> {
  const [row] = await db.select().from(eventConfig).where(eq(eventConfig.id, 1));
  if (!row) {
    // Insert default row
    await db.insert(eventConfig).values({
      ...DEFAULT_CONFIG,
      priceGeneral: String(DEFAULT_CONFIG.priceGeneral),
      priceVip: String(DEFAULT_CONFIG.priceVip),
    });
    return DEFAULT_CONFIG;
  }
  return rowToConfig(row);
}

export async function updateEventConfig(data: Partial<EventConfig>): Promise<EventConfig> {
  const updates: Partial<typeof eventConfig.$inferInsert> = {};

  if (data.eventName !== undefined) updates.eventName = data.eventName;
  if (data.eventDate !== undefined) updates.eventDate = data.eventDate;
  if (data.eventTime !== undefined) updates.eventTime = data.eventTime;
  if (data.venue !== undefined) updates.venue = data.venue;
  if (data.venueAddress !== undefined) updates.venueAddress = data.venueAddress;
  if (data.ticketUrlGeneral !== undefined) updates.ticketUrlGeneral = data.ticketUrlGeneral;
  if (data.ticketUrlVip !== undefined) updates.ticketUrlVip = data.ticketUrlVip;
  if (data.priceGeneral !== undefined) updates.priceGeneral = String(data.priceGeneral);
  if (data.priceVip !== undefined) updates.priceVip = String(data.priceVip);
  if (data.heroImageUrl !== undefined) updates.heroImageUrl = data.heroImageUrl;

  const [existing] = await db.select().from(eventConfig).where(eq(eventConfig.id, 1));
  if (existing) {
    await db.update(eventConfig).set(updates).where(eq(eventConfig.id, 1));
  } else {
    await db.insert(eventConfig).values({
      ...DEFAULT_CONFIG,
      priceGeneral: String(DEFAULT_CONFIG.priceGeneral),
      priceVip: String(DEFAULT_CONFIG.priceVip),
      ...updates,
    });
  }

  return getEventConfig();
}
