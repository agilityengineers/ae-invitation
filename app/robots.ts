import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

/** Robots — index public pages, keep admin/api/preview/book out of the index. */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/preview/", "/book/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
