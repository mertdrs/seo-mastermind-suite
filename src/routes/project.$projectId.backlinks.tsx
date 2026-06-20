import { Link, Outlet, createFileRoute, useParams, useRouterState } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Pill } from "@/components/app/Atoms";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/project-store";

export const Route = createFileRoute("/project/$projectId/backlinks")({
  head: () => ({
    meta: [
      { title: "Backlinks — Verity" },
      { name: "description", content: "Live-Backlink-Monitoring: neue, verlorene, defekte Links und Disavow." },
    ],
  }),
  component: Layout,
});

const TABS: { to: string; label: string; exact?: boolean }[] = [
  { to: "/project/$projectId/backlinks", label: "Übersicht", exact: true },
  { to: "/project/$projectId/backlinks/verweisende-domains", label: "Verweisende Domains" },
  { to: "/project/$projectId/backlinks/neu", label: "Neu" },
  { to: "/project/$projectId/backlinks/verloren", label: "Verloren" },
  { to: "/project/$projectId/backlinks/anchors", label: "Anchors" },
  { to: "/project/$projectId/backlinks/defekte", label: "Defekte" },
  { to: "/project/$projectId/backlinks/disavow", label: "Disavow" },
];

function Layout() {
  const { projectId } = useParams({ from: "/project/$projectId/backlinks" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const projects = useProjects();
  const project = projects.find((p) => p.id === projectId);
  const domain = project?.domain ?? "verity.app";

  return (
    <AppShell title="Backlinks" subtitle={`${domain} · Linkprofil & Risiken`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1 border-b border-border w-full overflow-x-auto" role="tablist" aria-label="Backlinks-Bereiche">
            {TABS.map((t) => {
              const resolved = t.to.replace("$projectId", projectId);
              const active = t.exact
                ? pathname === resolved
                : pathname === resolved || pathname.startsWith(resolved + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to as any}
                  params={{ projectId }}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "relative px-3 py-2.5 text-sm font-medium transition-colors -mb-px whitespace-nowrap",
                    active
                      ? "text-foreground border-b-2"
                      : "text-ink-muted hover:text-foreground border-b-2 border-transparent",
                  )}
                  style={active ? { borderColor: "var(--brand)" } : undefined}
                >
                  {t.label}
                </Link>
              );
            })}
            <div className="ml-auto flex items-center gap-2 pb-2">
              <Pill><Share2 className="size-3.5" />CSV exportieren</Pill>
            </div>
          </nav>
        </div>
        <Outlet />
      </div>
    </AppShell>
  );
}
