import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Variant } from "@/config/schema";
import { clientDefault } from "@/config/defaults";
import { LandingPage } from "@/components/landing/LandingPage";
import { JsonLd } from "@/components/landing/JsonLd";

/**
 * Public generic CLIENT page (/client). Serves whichever variant the admin has
 * marked default for the "client" type (via /api/public/defaults/client), falling
 * back to the bundled `clientDefault` template if the API/DB is unavailable. The
 * endpoint itself already falls back to the bundled constant when no default is
 * set, so between the two this route never dead-ends.
 */
export default function ClientPage() {
  const { data, isError } = useQuery({
    queryKey: ["default-variant", "client"],
    queryFn: async () => {
      const res = await fetch("/api/public/defaults/client");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  const variant = isError ? clientDefault : data?.variant;

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
