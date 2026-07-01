import Link from "next/link";
import { listVariants } from "@/lib/config";
import { VariantsTable } from "@/components/admin/VariantsTable";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  let variants: Awaited<ReturnType<typeof listVariants>> = [];
  let dbError = false;
  try {
    variants = await listVariants();
  } catch {
    dbError = true;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold text-navy">Pages</h1>
        <Link href="/admin/new" className="ae-cta rounded-[10px] bg-cta px-4 py-2.5 font-display text-sm font-bold text-white">
          New page →
        </Link>
      </div>
      {dbError ? (
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
            updatedAt: v.updatedAt ?? "",
          }))}
        />
      )}
    </div>
  );
}
