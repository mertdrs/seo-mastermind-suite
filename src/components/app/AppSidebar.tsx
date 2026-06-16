import { Link, useParams, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Compass,
  Search,
  Activity,
  Stethoscope,
  Link2,
  FileText,
  Swords,
  Sparkles,
  BarChart3,
  FileBarChart,
  Settings,
  Wrench,
  Palette,
  ChevronsUpDown,
  Check,
  ArrowLeft,
  GaugeCircle,
  Globe,
  Target,
  ListChecks,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects, type StoredProject } from "@/lib/project-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PROJECT_NAV = [
  {
    label: "Projekt",
    items: [
      { to: "/project/$projectId/site-audit", label: "Site Audit", icon: Stethoscope },
      { to: "/project/$projectId/site-explorer", label: "Site Explorer", icon: Compass },
      { to: "/project/$projectId/keywords", label: "Keywords Explorer", icon: Search },
      { to: "/project/$projectId/competitors", label: "Competitive Analysis", icon: Swords },
      { to: "/project/$projectId/content", label: "Content Explorer", icon: FileText },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { to: "/project/$projectId/rank-tracker", label: "Rank Tracker", icon: Activity },
      { to: "/project/$projectId/backlinks", label: "Backlinks", icon: Link2 },
      { to: "/project/$projectId/web-analytics", label: "Web Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "AI & Reporting",
    items: [
      { to: "/project/$projectId/brand-radar", label: "AI Visibility", icon: Sparkles, badge: "NEW" },
      { to: "/project/$projectId/reports", label: "Report Builder", icon: FileBarChart },
      { to: "/project/$projectId/tools", label: "Free SEO Tools", icon: Wrench },
    ],
  },
  {
    label: "Onpage-Analyse",
    items: [
      { to: "/project/$projectId/seo-check", label: "SEO Check", icon: GaugeCircle },
      { to: "/project/$projectId/keyword-check", label: "Keyword Check", icon: Target },
      { to: "/project/$projectId/keyword-recherche", label: "Keyword Recherche", icon: ListChecks },
      { to: "/project/$projectId/seo-compare", label: "SEO Compare", icon: FileSearch },
      { to: "/project/$projectId/ranking-check", label: "Ranking Check", icon: Activity },
      { to: "/project/$projectId/wdf-idf", label: "WDF*IDF Tool", icon: BarChart3 },
      { to: "/project/$projectId/backlink-check", label: "Backlink Check", icon: Link2 },
      { to: "/project/$projectId/serp-snippet", label: "SERP Snippet Generator", icon: Globe },
    ],
  },
] as const;

const WORKSPACE_NAV = [
  {
    label: "Workspace",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "System",
    items: [{ to: "/brand-guide", label: "Brand Guide", icon: Palette }],
  },
] as const;

export function AppSidebar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { projectId } = useParams({ strict: false }) as { projectId?: string };
  const projects = useProjects();
  const activeProject: StoredProject | undefined = projectId
    ? projects.find((p) => p.id === projectId)
    : undefined;

  const inProject = Boolean(activeProject);
  const isActive = (to: string, exact?: boolean) => {
    const resolved = projectId ? to.replace("$projectId", projectId) : to;
    return exact ? pathname === resolved : pathname === resolved || pathname.startsWith(resolved + "/");
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border glass">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div
          className="relative size-8 rounded-lg overflow-hidden grid place-items-center"
          style={{ background: "linear-gradient(135deg, var(--signal), var(--chart-5))" }}
        >
          <span className="text-display font-bold text-[color:var(--background)] text-sm">V</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-display font-bold tracking-tight">Verity</span>
          <span className="text-[10px] text-muted-foreground text-mono uppercase tracking-widest">SEO · AEO</span>
        </div>
      </div>

      {/* Project switcher / back-to-dashboard */}
      <div className="px-3 mb-3">
        {inProject ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full group flex items-center gap-2 rounded-xl border border-border bg-muted/50 hover:bg-muted px-3 py-2.5 transition-colors">
                <span className="text-lg">{activeProject!.countryFlag}</span>
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="text-[10px] text-muted-foreground text-mono uppercase tracking-widest">Projekt</span>
                  <span className="text-sm font-medium truncate w-full text-left">{activeProject!.domain}</span>
                </div>
                <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-mono text-[10px] uppercase tracking-widest">Projekt wechseln</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {projects.map((p) => (
                <DropdownMenuItem key={p.id} asChild>
                  <Link to="/project/$projectId/site-audit" params={{ projectId: p.id }} className="gap-2 cursor-pointer">
                    <span>{p.countryFlag}</span>
                    <span className="flex-1 truncate">{p.domain}</span>
                    {p.id === activeProject!.id && <Check className="size-3.5 text-[color:var(--signal-foreground)]" />}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="gap-2 cursor-pointer">
                  <ArrowLeft className="size-3.5" />
                  <span>Alle Projekte</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5"
          >
            <LayoutDashboard className="size-4 text-ink-subtle" />
            <span className="text-sm font-medium">Alle Projekte</span>
          </Link>
        )}
      </div>

      {/* Search trigger */}
      <div className="px-3 mb-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 px-3 py-2 transition-colors text-left"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1">Schnellsuche…</span>
          <kbd className="text-[10px] text-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-black/5">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {(inProject ? PROJECT_NAV : WORKSPACE_NAV).map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] text-mono text-muted-foreground uppercase tracking-[0.18em]">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item: any) => {
                const active = isActive(item.to, item.exact);
                const Icon = item.icon;
                const linkProps = projectId && item.to.includes("$projectId")
                  ? { to: item.to, params: { projectId } }
                  : { to: item.to };
                return (
                  <Link
                    key={item.to}
                    {...(linkProps as any)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r"
                        style={{ background: "var(--signal)", boxShadow: "0 0 8px var(--signal)" }}
                      />
                    )}
                    <Icon className={cn("size-4 shrink-0", active && "text-[color:var(--signal-foreground)]")} />
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[9px] text-mono px-1.5 py-0.5 rounded font-bold tracking-wider"
                        style={{
                          background: "color-mix(in oklab, var(--violet) 18%, transparent)",
                          color: "var(--violet)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Always-visible system shortcuts when inside a project */}
        {inProject && (
          <div>
            <div className="px-3 mb-1.5 text-[10px] text-mono text-muted-foreground uppercase tracking-[0.18em]">System</div>
            <div className="space-y-0.5">
              <Link to="/brand-guide" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Palette className="size-4" />
                <span className="font-medium">Brand Guide</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Footer / user */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          to="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="size-4" />
          <span>Einstellungen</span>
        </Link>
        <div className="mt-2 flex items-center gap-2.5 px-3 py-2">
          <div
            className="size-8 rounded-full grid place-items-center text-xs font-semibold text-mono"
            style={{ background: "linear-gradient(135deg, var(--violet), var(--rose))", color: "white" }}
          >
            LM
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-xs font-medium truncate">Lars Müller</span>
            <span className="text-[10px] text-muted-foreground truncate">Pro · 14 Tage</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
