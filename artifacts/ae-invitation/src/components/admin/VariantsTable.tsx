"use client";

import { useState } from "react";
import { Link } from "wouter";

interface Row {
  slug: string;
  label: string;
  templateType: string;
  published: boolean;
  updatedAt: string;
}

export function VariantsTable({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(slug: string, action: "publish" | "unpublish" | "delete") {
    if (action === "delete" && !confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBusy(slug);
    try {
      const res = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      if (action === "delete") setRows((r) => r.filter((x) => x.slug !== slug));
      else setRows((r) => r.map((x) => (x.slug === slug ? { ...x, published: action === "publish" } : x)));
    } catch {
      alert("That action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-white p-6 text-muted">
        No pages yet. <Link href="/admin/new" className="text-teal underline">Generate your first page →</Link>
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-bg-alt text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Page</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.slug} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <div className="font-display font-bold text-navy">{r.label}</div>
                <div className="text-xs text-muted-2">/{r.slug}</div>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-bg-alt px-2.5 py-1 text-xs font-semibold capitalize text-navy">{r.templateType}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.published ? "bg-green-100 text-cta" : "bg-amber-100 text-amber-700"}`}>
                  {r.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                  <Link href={`/admin/${r.slug}`} className="text-teal underline">Edit</Link>
                  <Link href={r.published ? `/${r.slug}` : `/preview/${r.slug}`} className="text-teal underline" target="_blank">
                    {r.published ? "View" : "Preview"}
                  </Link>
                  <button onClick={() => act(r.slug, r.published ? "unpublish" : "publish")} disabled={busy === r.slug} className="text-navy underline disabled:opacity-50">
                    {r.published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => act(r.slug, "delete")} disabled={busy === r.slug} className="text-red-600 underline disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
