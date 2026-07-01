import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";

interface Lead {
  id: string | number;
  name?: string | null;
  email: string;
  company?: string | null;
  phone?: string | null;
  variant_slug: string;
  score: number;
  tier: string;
  zapier_status: string;
  created_at: string;
}

const TIER_COLOR: Record<string, string> = {
  elite: "bg-green-100 text-cta",
  moderate: "bg-blue-100 text-navy",
  low: "bg-amber-100 text-amber-700",
  disqualified: "bg-red-100 text-red-600",
};

export default function LeadsPage() {
  const { data, isError } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("db-error");
      return (await res.json()) as { leads: Lead[] };
    },
    retry: false,
  });

  const leads = data?.leads ?? [];

  return (
    <AdminShell>
      <div>
        <h1 className="mb-2 font-display text-2xl font-extrabold text-navy">Leads</h1>
        <p className="mb-6 text-muted">
          Captured from the qualifier, with score and tier. Each also fired the Zapier webhook
          (status shown) so it fans out to your downstream apps.
        </p>
        {isError ? (
          <p className="rounded-xl border border-line bg-white p-5 text-muted">Couldn&apos;t reach the database.</p>
        ) : leads.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-6 text-muted">No leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-bg-alt text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lead</th>
                  <th className="px-4 py-3 font-semibold">Page</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Tier</th>
                  <th className="px-4 py-3 font-semibold">Zapier</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-display font-bold text-navy">{l.name || "—"}</div>
                      <div className="text-xs text-muted-2">
                        {l.email}
                        {l.company ? ` · ${l.company}` : ""}
                        {l.phone ? ` · ${l.phone}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-2">/{l.variant_slug}</td>
                    <td className="px-4 py-3 font-display font-bold text-navy">{l.score}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${TIER_COLOR[l.tier] ?? "bg-bg-alt text-muted"}`}>{l.tier}</span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-muted-2">{l.zapier_status}</td>
                    <td className="px-4 py-3 text-xs text-muted-2">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
