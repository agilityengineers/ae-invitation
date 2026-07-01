import { useQuery } from "@tanstack/react-query";
import type { FrontPage } from "@/config/schema";
import { frontPageDefault } from "@/config/defaults";
import { AdminShell } from "@/components/admin/AdminShell";
import { FrontPageEditForm } from "@/components/admin/FrontPageEditForm";
import { Spinner } from "@/components/ui/spinner";

/**
 * Admin page for editing the public front page (/). Falls back to the bundled
 * `frontPageDefault` whenever the config can't be loaded (mirrors the public
 * front page's own fallback), so the editor always opens editable instead of
 * dead-ending on a blank screen.
 */
export default function FrontPageEditPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-frontpage"],
    queryFn: async () => {
      const res = await fetch("/api/frontpage");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { frontPage: FrontPage };
    },
    retry: false,
  });

  const initial = isError || !data?.frontPage ? frontPageDefault : data.frontPage;

  return (
    <AdminShell>
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-6 text-muted-2" />
        </div>
      ) : (
        <FrontPageEditForm initial={initial} />
      )}
    </AdminShell>
  );
}
