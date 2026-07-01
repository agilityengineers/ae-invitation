import type { MetadataRoute } from "next";
import { listPublishedVariants } from "@/lib/config";
import { siteUrl } from "@/lib/env";

// Generated at request time so newly published variants appear without a rebuild.
export const dynamic = "force-dynamic";

/** Sitemap — root + published variants only (drafts are excluded). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];
  try {
    for (const v of await listPublishedVariants()) {
      entries.push({
        url: `${base}/${v.slug}`,
        lastModified: v.updatedAt ? new Date(v.updatedAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // DB unreachable — return the root entry only.
  }
  return entries;
}
