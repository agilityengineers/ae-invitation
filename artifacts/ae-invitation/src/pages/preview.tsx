import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Variant } from "@/config/schema";
import { LandingPage } from "@/components/landing/LandingPage";
import NotFound from "@/pages/not-found";

/** Authenticated draft preview — renders any variant, published or not. */
export default function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [, navigate] = useLocation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["preview-variant", slug],
    queryFn: async () => {
      const res = await fetch(`/api/variants/${slug}`);
      if (res.status === 401) throw new Error("unauthorized");
      if (!res.ok) throw new Error("not-found");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  useEffect(() => {
    if (error instanceof Error && error.message === "unauthorized") {
      navigate(`/admin/login?from=/preview/${slug}`);
    }
  }, [error, navigate, slug]);

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (error instanceof Error && error.message === "unauthorized") return null;
  if (isError || !data?.variant) return <NotFound />;

  const variant = data.variant;

  return (
    <>
      <div style={{ background: "#08527F", color: "#fff", textAlign: "center", padding: "8px 16px", font: "600 13px var(--font-body)" }}>
        Preview — {variant.published ? "published" : "draft (not public)"}
      </div>
      <LandingPage variant={variant} />
    </>
  );
}
