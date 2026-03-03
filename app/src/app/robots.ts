import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fullertonrotary.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal",
          "/admin",
          "/uncorked-hub",
          "/api",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
