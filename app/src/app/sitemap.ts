import { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ROTARY_BASE = "https://fullertonrotaryclub.com";
const UNCORKED_BASE = "https://fullertonuncorked.org";

const rotaryStaticRoutes: MetadataRoute.Sitemap = [
  { url: `${ROTARY_BASE}/`, changeFrequency: "weekly", priority: 1.0 },
  { url: `${ROTARY_BASE}/about`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${ROTARY_BASE}/events`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${ROTARY_BASE}/join`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${ROTARY_BASE}/contact`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${ROTARY_BASE}/programs`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${ROTARY_BASE}/uncorked`, changeFrequency: "monthly", priority: 0.7 },
];

const uncorkedStaticRoutes: MetadataRoute.Sitemap = [
  { url: `${UNCORKED_BASE}/`, changeFrequency: "weekly", priority: 1.0 },
  { url: `${UNCORKED_BASE}/vendors`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${UNCORKED_BASE}/sponsors`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${UNCORKED_BASE}/vendor-interest`, changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let cmsRoutes: MetadataRoute.Sitemap = [];

  try {
    const cmsPages = await db
      .select({ slug: pages.slug, updatedAt: pages.updatedAt })
      .from(pages)
      .where(eq(pages.published, true));

    cmsRoutes = cmsPages.map((page: { slug: string; updatedAt: Date }) => ({
      url: `${ROTARY_BASE}/${page.slug}`,
      lastModified: page.updatedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic pages
  }

  return [...rotaryStaticRoutes, ...uncorkedStaticRoutes, ...cmsRoutes];
}
