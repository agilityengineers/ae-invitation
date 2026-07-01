import type { Variant } from "@/config/schema";
import { siteUrl } from "@/lib/env";

/** Organization + WebPage JSON-LD for crawlers. */
export function JsonLd({ variant }: { variant: Variant }) {
  const url = `${siteUrl()}/${variant.slug}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Agility Engineers",
        url: "https://agilityengineers.com/",
        ...(variant.copy.footer.phone ? { telephone: variant.copy.footer.phone } : {}),
        description: variant.meta.description || variant.copy.hero.subhead,
      },
      {
        "@type": "WebPage",
        name: variant.meta.title || variant.copy.hero.headline,
        description: variant.meta.description || variant.copy.hero.subhead,
        url,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
