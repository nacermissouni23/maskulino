import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private admin area: never crawl, never show the link anywhere.
        disallow: ["/imad29052005", "/api/push/", "/api/telegram/"],
      },
    ],
  };
}
