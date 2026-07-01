import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface PublishedVariant {
  slug: string;
  label: string;
}

/** Minimal root index — links to published variants and the admin. */
export default function HomePage() {
  const { data } = useQuery({
    queryKey: ["public-variants"],
    queryFn: async () => {
      const res = await fetch("/api/public/variants");
      if (!res.ok) return { variants: [] };
      return (await res.json()) as { variants: PublishedVariant[] };
    },
  });

  const published = (data?.variants ?? []).map((v) => ({ slug: v.slug, label: v.label }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 font-body text-ink">
      <p className="text-xs font-display font-bold uppercase tracking-[0.14em] text-teal">
        Agility Engineers
      </p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-navy">
        Landing-page generator
      </h1>
      <p className="mt-4 text-muted-2">
        Client Target &amp; Talent / Directory StoryBrand pages, generated and published per variant.
      </p>

      {published.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
            Published pages
          </h2>
          <ul className="mt-3 space-y-2">
            {published.map((v) => (
              <li key={v.slug}>
                <Link className="text-teal underline" href={`/${v.slug}`}>
                  {v.label} <span className="text-muted-2">/{v.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10">
        <Link
          href="/admin"
          className="ae-cta inline-block rounded-[var(--radius-btn)] bg-cta px-5 py-3 font-display font-bold text-white"
        >
          Open admin →
        </Link>
      </p>
    </main>
  );
}
