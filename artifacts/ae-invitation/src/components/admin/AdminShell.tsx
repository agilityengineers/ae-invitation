import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LogoutButton } from "@/components/admin/LogoutButton";

/** Admin shell — sidebar nav + content, gated on the admin session. */
export function AdminShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return { authed: false };
      return (await res.json()) as { authed: boolean };
    },
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && data && !data.authed) {
      navigate(`/admin/login?from=${encodeURIComponent(location)}`);
    }
  }, [isLoading, data, navigate, location]);

  if (isLoading || !data?.authed) return <div className="min-h-screen bg-bg-alt" />;

  return (
    <div className="min-h-screen bg-bg-alt font-body text-ink md:flex">
      <aside className="shrink-0 border-b border-line bg-white md:w-60 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-teal">
            Agility Engineers
          </p>
          <p className="mt-1 font-display text-sm font-bold text-navy">Page admin</p>
        </div>
        <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col md:flex-nowrap">
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-bg-alt" href="/admin">
            Pages
          </Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-bg-alt" href="/admin/frontpage">
            Front page
          </Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-bg-alt" href="/admin/new">
            New page
          </Link>
          <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-bg-alt" href="/admin/leads">
            Leads
          </Link>
          <div className="px-3 py-2">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
