import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVariant } from "@/lib/config";
import { Logo } from "@/components/landing/Logo";
import { EmbedHost } from "@/components/booking/EmbedHost";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Dedicated in-app booking page for variants using booking.mode = "embed". */
export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = await getVariant(slug).catch(() => null);
  if (!variant) notFound();

  const { booking } = variant;
  const talent = variant.templateType === "talent";
  const title = talent ? "Complete your directory profile" : "Book your Agility Assessment";

  return (
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--font-body)" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-line)" }}>
        <header style={{ maxWidth: 980, margin: "0 auto", padding: "14px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo treatment="chip" />
          <Link href={`/${slug}`} className="ae-nav">
            ← Back to the page
          </Link>
        </header>
      </div>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(24px,4vw,48px) clamp(16px,4vw,40px)" }}>
        <h1 style={{ font: "800 clamp(26px,3vw,38px)/1.15 var(--font-display)", color: "#08527F", marginBottom: 20 }}>{title}</h1>
        {booking.mode === "embed" && booking.embedCode.trim() ? (
          <EmbedHost embedCode={booking.embedCode} />
        ) : booking.url ? (
          <p style={{ font: "500 16px/1.6 var(--font-body)", color: "#5A6B73" }}>
            <a href={booking.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0F88A2", textDecoration: "underline" }}>
              Open the scheduler →
            </a>
          </p>
        ) : (
          <p style={{ font: "500 16px/1.6 var(--font-body)", color: "#5A6B73" }}>
            This page isn&apos;t configured for booking yet. An admin can add a scheduler embed or link
            in the page admin.
          </p>
        )}
      </div>
    </main>
  );
}
