import { useQuery } from "@tanstack/react-query";
import type { FrontPage } from "@/config/schema";
import { AdminShell } from "@/components/admin/AdminShell";
import { FrontPageEditForm } from "@/components/admin/FrontPageEditForm";

/** Admin page for editing the public front page (/). */
export default function FrontPageEditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-frontpage"],
    queryFn: async () => {
      const res = await fetch("/api/frontpage");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { frontPage: FrontPage };
    },
    retry: false,
  });

  return (
    <AdminShell>
      {isLoading || !data?.frontPage ? (
        <div className="min-h-[40vh]" />
      ) : (
        <FrontPageEditForm initial={data.frontPage} />
      )}
    </AdminShell>
  );
}
