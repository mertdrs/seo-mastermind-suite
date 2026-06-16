import { Link, Outlet, createFileRoute, useParams, useRouterState } from "@tanstack/react-router";
import { PlayCircle, Share2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Pill } from "@/components/app/Atoms";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/project-store";

export const Route = createFileRoute("/project/$projectId/site-audit")({
  head: () => ({
    meta: [
      { title: "Website Audit — Verity" },
      { name: "description", content: "Crawl-based technical health: errors, warnings, Core Web Vitals and on-page issues." },
    ],
  }),
  component: Layout,
});

const TABS = [
  { to: "/project/$projectId/site-audit/ueberblick", label: "Überblick" },
  { to: "/project/$projectId/site-audit/reports", label: "Reports" },
  { to: "/project/$projectId/site-audit/unterseiten", label: "Unterseiten" },
  { to: "/project/$projectId/site-audit/statistiken", label: "Statistiken" },
] as const;

function Layout() {
  const { projectId } = useParams({ from: "/project/$projectId/site-audit" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const projects = useProjects();
  const project = projects.find((p) => p.id === projectId);
  const domain = project?.domain ?? "verity.app";

  return (
    <AppShell title="Website Audit" subtitle={`${domain} · letzter Crawl vor 2h`}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1 border-b border-border w-full">
            {TABS.map((t) => {
              const resolved = t.to.replace("$projectId", projectId);
              const active = pathname === resolved || pathname.startsWith(resolved + "/");
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  params={{ projectId }}
                  className={cn(
                    "relative px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                    active
                      ? "text-foreground border-b-2 border-[color:var(--signal)]"
                      : "text-ink-muted hover:text-foreground border-b-2 border-transparent",
                  )}
                >
                  {t.label}
                </Link>
              );
            })}
            <div className="ml-auto flex items-center gap-2 pb-2">
              <Pill><Share2 className="size-3.5" />Exportieren</Pill>
              <Pill><PlayCircle className="size-3.5" />Neues Crawling</Pill>
            </div>
          </nav>
        </div>
        <Outlet />
      </div>
    </AppShell>
  );
}
