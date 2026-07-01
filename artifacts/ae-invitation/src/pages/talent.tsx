import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Variant } from "@/config/schema";
import { talentDefault } from "@/config/defaults";
import { LandingPage } from "@/components/landing/LandingPage";
import { JsonLd } from "@/components/landing/JsonLd";

/**
 * Public generic TALENT / directory page (/talent). Serves whichever variant the
 * admin has marked default for the "talent" type (via /api/public/defaults/talent),
 * falling back to the bundled `talentDefault` template if the API/DB is unavailable.
 * The endpoint also falls back to the bundled constant when no default is set, so
 * this route never dead-ends.
 */
export default function TalentPage() {
  const { data, isError } = useQuery({
    queryKey: ["default-variant", "talent"],
    queryFn: async () => {
      const res = await fetch("/api/public/defaults/talent");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  const variant = isError ? talentDefault : data?.variant;

  useEffect(() => {
    if (!variant) return;
    const title = variant.meta.title || variant.copy.hero.headline;
    if (title) document.title = title;
  }, [variant]);

  if (!variant) return <div className="min-h-screen bg-white" />;

  return (
    <>
      <JsonLd variant={variant} />
      <LandingPage variant={variant} />
    </>
  );
}
