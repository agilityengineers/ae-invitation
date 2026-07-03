import { useQuery } from "@tanstack/react-query";
import type { ProjectsPage } from "@/config/schema";
import { projectsDefault } from "@/config/defaults";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectsEditForm } from "@/components/admin/ProjectsEditForm";
import { Spinner } from "@/components/ui/spinner";

/**
 * Admin page for editing the public portfolio page (/projects). Falls back to
 * the bundled `projectsDefault` whenever the config can't be loaded (mirrors the
 * public page's own fallback), so the editor always opens editable instead of
 * dead-ending on a blank screen.
 */
export default function ProjectsEditPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { projects: ProjectsPage };
    },
    retry: false,
  });

  const initial = isError || !data?.projects ? projectsDefault : data.projects;

  return (
    <AdminShell>
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-6 text-muted-2" />
        </div>
      ) : (
        <ProjectsEditForm initial={initial} />
      )}
    </AdminShell>
  );
}
