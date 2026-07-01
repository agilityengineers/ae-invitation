import { useQuery } from "@tanstack/react-query";
import type { Provider } from "@/config/schema";
import { AdminShell } from "@/components/admin/AdminShell";
import { GeneratorForm } from "@/components/admin/GeneratorForm";

export default function NewPage() {
  const { data } = useQuery({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch("/api/providers");
      if (!res.ok) return { providers: [] as Provider[] };
      return (await res.json()) as { providers: Provider[] };
    },
    retry: false,
  });

  const providers = data?.providers ?? [];

  return (
    <AdminShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 font-display text-2xl font-extrabold text-navy">New page</h1>
        <p className="mb-6 text-muted">
          Generate a targeted page with AI (you pick the provider), or create a blank one from the
          template default to fill in by hand.
        </p>
        <GeneratorForm providers={providers} />
      </div>
    </AdminShell>
  );
}
