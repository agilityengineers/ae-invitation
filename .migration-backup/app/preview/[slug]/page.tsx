import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVariant } from "@/lib/config";
import { LandingPage } from "@/components/landing/LandingPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Authenticated draft preview (middleware-gated) — renders any variant, published or not. */
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const variant = await getVariant(slug).catch(() => null);
  if (!variant) notFound();
  return (
    <>
      <div style={{ background: "#08527F", color: "#fff", textAlign: "center", padding: "8px 16px", font: "600 13px var(--font-body)" }}>
        Preview — {variant.published ? "published" : "draft (not public)"}
      </div>
      <LandingPage variant={variant} />
    </>
  );
}
