import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVariant, listSlugs } from "@/lib/config";
import { siteUrl } from "@/lib/env";
import { LandingPage } from "@/components/landing/LandingPage";

/** Pre-render known slugs; render new ones on demand (ISR), revalidated on publish. */
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return (await listSlugs()).map((slug) => ({ slug }));
  } catch {
    // DB not reachable at build time — every page renders on demand instead.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const variant = await getVariant(slug).catch(() => null);
  if (!variant) return { title: "Agility Engineers" };

  const m = variant.meta;
  const title = m.title || variant.copy.hero.headline;
  const description = m.description || variant.copy.hero.subhead;
  const canonical = m.canonical || `${siteUrl()}/${slug}`;
  const ogImage = m.ogImage || variant.copy.hero.media.imageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: m.ogTitle || title,
      description: m.ogDescription || description,
      url: canonical,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: m.ogTitle || title,
      description: m.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function VariantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = await getVariant(slug).catch(() => null);
  // Public route serves published pages only; drafts preview at /admin/preview/[slug].
  if (!variant || !variant.published) notFound();

  return <LandingPage variant={variant} />;
}
