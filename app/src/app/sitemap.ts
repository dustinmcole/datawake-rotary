import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.fullertonrotary.org";
  const routes = [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/about`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/events`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/programs`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/join`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${base}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/uncorked`, priority: 0.7, changeFrequency: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: route.url,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
