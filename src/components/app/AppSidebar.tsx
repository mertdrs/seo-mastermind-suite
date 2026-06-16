import { Link, useRouterState } from "@tanstack/react-router";
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
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PROJECTS } from "@/lib/mock/seo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Research",
    items: [
      { to: "/site-explorer", label: "Site Explorer", icon: Compass },
      { to: "/keywords", label: "Keywords Explorer", icon: Search },
      { to: "/competitors", label: "Competitive Analysis", icon: Swords },
      { to: "/content", label: "Content Explorer", icon: FileText },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { to: "/rank-tracker", label: "Rank Tracker", icon: Activity },
      { to: "/site-audit", label: "Site Audit", icon: Stethoscope },
      { to: "/backlinks", label: "Backlinks", icon: Link2 },
      { to: "/web-analytics", label: "Web Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "AI & Reporting",
    items: [
      { to: "/brand-radar", label: "AI Visibility", icon: Sparkles, badge: "NEW" },
      { to: "/reports", label: "Report Builder", icon: FileBarChart },
      { to: "/tools", label: "Free SEO Tools", icon: Wrench },
    ],
  },
] as const;

export function AppSidebar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [project, setProject] = useState(PROJECTS[0]!);

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border glass">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="relative size-8 rounded-lg overflow-hidden grid place-items-center"
          style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))" }}>
          <span className="text-display font-bold text-[color:var(--background)] text-sm">V</span>
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-display font-bold tracking-tight">Verity</span>
          <span className="text-[10px] text-muted-foreground text-mono uppercase tracking-widest">SEO · AEO</span>
        </div>
      </div>

      {/* Project switcher */}
      <div className="px-3 mb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full group flex items-center gap-2 rounded-xl border border-border bg-muted/50 hover:bg-muted px-3 py-2.5 transition-colors">
              <span className="text-lg">{project.countryFlag}</span>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground text-mono uppercase tracking-widest">Project</span>
                <span className="text-sm font-medium truncate w-full text-left">{project.domain}</span>
              </div>
              <ChevronsUpDown className="size-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuLabel className="text-mono text-[10px] uppercase tracking-widest">Switch project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROJECTS.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => setProject(p)} className="gap-2">
                <span>{p.countryFlag}</span>
                <span className="flex-1 truncate">{p.domain}</span>
                {p.id === project.id && <Check className="size-3.5 text-[color:var(--aurora-cyan)]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search trigger */}
      <div className="px-3 mb-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 px-3 py-2 transition-colors text-left"
        >
          <Search className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground flex-1">Quick search…</span>
          <kbd className="text-[10px] text-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-black/20">⌘K</kbd>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] text-mono text-muted-foreground uppercase tracking-[0.18em]">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.to, "exact" in item ? item.exact : false);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
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
                        style={{ background: "linear-gradient(180deg, var(--aurora-cyan), var(--aurora-violet))", boxShadow: "0 0 8px var(--aurora-cyan)" }}
                      />
                    )}
                    <Icon className={cn("size-4 shrink-0", active && "text-[color:var(--aurora-cyan)]")} />
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="text-[9px] text-mono px-1.5 py-0.5 rounded font-bold tracking-wider"
                        style={{
                          background: "color-mix(in oklab, var(--aurora-violet) 18%, transparent)",
                          color: "oklch(0.92 0.06 295)",
                        }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / user */}
      <div className="px-3 py-4 border-t border-border">
        <Link
          to="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </Link>
        <div className="mt-2 flex items-center gap-2.5 px-3 py-2">
          <div className="size-8 rounded-full grid place-items-center text-xs font-semibold text-mono"
            style={{ background: "linear-gradient(135deg, var(--aurora-violet), var(--aurora-magenta))" }}>
            LM
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-xs font-medium truncate">Lars Müller</span>
            <span className="text-[10px] text-muted-foreground truncate">Pro · 14 days left</span>
          </div>
        </div>
      </div>
    </aside>
  );
}