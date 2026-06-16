import { createFileRoute, Outlet, useParams, Link } from "@tanstack/react-router";
import { getProject } from "@/lib/project-store";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  return <Outlet />;
}

// Helper used by child routes for resolving the active project.
export function useActiveProject() {
  const { projectId } = useParams({ strict: false }) as { projectId?: string };
  if (!projectId) return null;
  return getProject(projectId) ?? null;
}

export function ProjectMissing() {
  return (
    <AppShell title="Projekt nicht gefunden">
      <div className="glass ring-aurora rounded-2xl p-8 text-center">
        <p className="text-sm text-ink-muted mb-4">Dieses Projekt existiert nicht oder wurde gelöscht.</p>
        <Link to="/dashboard" className="text-sm text-[color:var(--signal-foreground)] underline">
          Zurück zum Dashboard
        </Link>
      </div>
    </AppShell>
  );
}