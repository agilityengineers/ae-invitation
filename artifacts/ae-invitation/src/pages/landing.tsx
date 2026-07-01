import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Variant } from "@/config/schema";
import { LandingPage } from "@/components/landing/LandingPage";
import { JsonLd } from "@/components/landing/JsonLd";
import NotFound from "@/pages/not-found";

/** Public landing route — serves published variants only. */
export default function LandingRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-variant", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/variants/${slug}`);
      if (!res.ok) throw new Error("not-found");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  const variant = data?.variant;

  useEffect(() => {
    if (!variant) return;
    const title = variant.meta.title || variant.copy.hero.headline;
    if (title) document.title = title;
  }, [variant]);

  if (isLoading) return <div className="min-h-screen bg-white" />;
  if (isError || !variant) return <NotFound />;

  return (
    <>
      <JsonLd variant={variant} />
      <LandingPage variant={variant} />
    </>
  );
}
