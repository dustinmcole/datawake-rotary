import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/events",
          "/join",
          "/contact",
          "/programs",
          "/uncorked",
          "/vendors",
          "/sponsors",
          "/vendor-interest",
        ],
        disallow: ["/portal", "/admin", "/uncorked-hub", "/api"],
      },
    ],
    sitemap: [
      "https://fullertonrotaryclub.com/sitemap.xml",
      "https://fullertonuncorked.org/sitemap.xml",
    ],
  };
}
