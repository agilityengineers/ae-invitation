import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Provider, Variant } from "@/config/schema";
import { AdminShell } from "@/components/admin/AdminShell";
import { EditForm } from "@/components/admin/EditForm";
import NotFound from "@/pages/not-found";

function isGenerated(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("generated") === "1";
}

export default function EditPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const variantQuery = useQuery({
    queryKey: ["admin-variant", slug],
    queryFn: async () => {
      const res = await fetch(`/api/variants/${slug}`);
      if (!res.ok) throw new Error("not-found");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch("/api/providers");
      if (!res.ok) return { providers: [] as Provider[] };
      return (await res.json()) as { providers: Provider[] };
    },
    retry: false,
  });

  return (
    <AdminShell>
      {variantQuery.isLoading ? (
        <div className="min-h-[40vh]" />
      ) : variantQuery.isError || !variantQuery.data?.variant ? (
        <NotFound />
      ) : (
        <EditForm
          initial={variantQuery.data.variant}
          providers={providersQuery.data?.providers ?? []}
          generated={isGenerated()}
        />
      )}
    </AdminShell>
  );
}
