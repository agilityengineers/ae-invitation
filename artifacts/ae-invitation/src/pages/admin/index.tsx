import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { VariantsTable } from "@/components/admin/VariantsTable";

interface VariantSummary {
  slug: string;
  label: string;
  templateType: string;
  published: boolean;
  isDefault?: boolean;
  updatedAt?: string | null;
}

export default function AdminHome() {
  const { data, isError } = useQuery({
    queryKey: ["admin-variants"],
    queryFn: async () => {
      const res = await fetch("/api/variants");
      if (!res.ok) throw new Error("db-error");
      return (await res.json()) as { variants: VariantSummary[] };
    },
    retry: false,
  });

  const variants = data?.variants ?? [];

  return (
    <AdminShell>
      <div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-extrabold text-navy">Pages</h1>
          <Link href="/admin/new" className="ae-cta rounded-[10px] bg-cta px-4 py-2.5 font-display text-sm font-bold text-white">
            New page →
          </Link>
        </div>
        {isError ? (
          <p className="rounded-xl border border-line bg-white p-5 text-muted">
            Couldn&apos;t reach the database. Check <code>DATABASE_URL</code>.
          </p>
        ) : (
          <VariantsTable
            initial={variants.map((v) => ({
              slug: v.slug,
              label: v.label,
              templateType: v.templateType,
              published: v.published,
              isDefault: v.isDefault ?? false,
              updatedAt: v.updatedAt ?? "",
            }))}
          />
        )}
      </div>
    </AdminShell>
  );
}
