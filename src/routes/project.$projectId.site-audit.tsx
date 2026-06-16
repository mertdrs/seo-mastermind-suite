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

type Sev = "error" | "warning" | "notice";

const ISSUES: { title: string; category: string; sev: Sev; affected: number; change: number }[] = [
  { title: "Pages with 4xx status code", category: "Crawlability", sev: "error", affected: 14, change: +3 },
  { title: "Broken internal links", category: "Links", sev: "error", affected: 38, change: -5 },
  { title: "Missing canonical tag", category: "On-page", sev: "warning", affected: 62, change: 0 },
  { title: "Slow LCP on mobile", category: "Core Web Vitals", sev: "warning", affected: 88, change: -12 },
  { title: "Duplicate title tags", category: "On-page", sev: "warning", affected: 24, change: +4 },
  { title: "Images without alt text", category: "Accessibility", sev: "warning", affected: 156, change: -20 },
  { title: "Pages without H1", category: "On-page", sev: "notice", affected: 12, change: 0 },
  { title: "Thin content (<200 words)", category: "Content", sev: "notice", affected: 47, change: +8 },
  { title: "Long meta descriptions", category: "On-page", sev: "notice", affected: 31, change: -2 },
  { title: "Pages blocked by robots.txt", category: "Crawlability", sev: "warning", affected: 9, change: 0 },
  { title: "Mixed content (HTTP on HTTPS)", category: "Security", sev: "error", affected: 4, change: -1 },
  { title: "Missing structured data", category: "On-page", sev: "notice", affected: 92, change: +14 },
];

function Page() {
  const [sev, setSev] = useState<"all" | Sev>("all");
  const filtered = ISSUES.filter((i) => sev === "all" || i.sev === sev);

  const counts = {
    error: ISSUES.filter((i) => i.sev === "error").length,
    warning: ISSUES.filter((i) => i.sev === "warning").length,
    notice: ISSUES.filter((i) => i.sev === "notice").length,
  };
  const totalAffected = ISSUES.reduce((s, i) => s + i.affected, 0);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    ISSUES.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + i.affected));
    return [...map.entries()]
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const health = 78;

  return (
    <AppShell title="Site Audit" subtitle="verity.app · 1,284 pages crawled · last run 2h ago">
      <div className="flex flex-col gap-6">
        <section className="glass ring-aurora rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill>
              <Search className="size-3.5" /> verity.app
            </Pill>
            <Chip>Crawled · 1,284</Chip>
            <Chip>Mobile</Chip>
            <Chip>JS rendering</Chip>
          </div>
          <div className="flex items-center gap-2">
            <Pill>Schedule</Pill>
            <Pill>
              <PlayCircle className="size-3.5" /> Re-crawl
            </Pill>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Site Health" subtitle="Aggregated technical score">
            <div className="flex flex-col items-center gap-4">
              <HealthRing score={health} />
              <div className="w-full flex flex-col gap-2">
                <ScoreBar label="Crawlability" value={88} />
                <ScoreBar label="Core Web Vitals" value={62} />
                <ScoreBar label="On-page" value={74} />
                <ScoreBar label="Links" value={81} />
                <ScoreBar label="Security" value={94} />
              </div>
            </div>
          </Panel>

          <div className="xl:col-span-2 flex flex-col gap-4">
            <section className="grid grid-cols-3 gap-3">
              <SevTile sev="error" count={counts.error} total={ISSUES.filter((i) => i.sev === "error").reduce((s, i) => s + i.affected, 0)} />
              <SevTile sev="warning" count={counts.warning} total={ISSUES.filter((i) => i.sev === "warning").reduce((s, i) => s + i.affected, 0)} />
              <SevTile sev="notice" count={counts.notice} total={ISSUES.filter((i) => i.sev === "notice").reduce((s, i) => s + i.affected, 0)} />
            </section>

            <Panel title="Issues by Category" subtitle={`${formatNumber(totalAffected)} affected URLs across all categories`}>
              <div className="h-56 -mx-2">
                <ResponsiveContainer>
                  <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} width={108} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {byCategory.map((_, i) => (
                        <Cell key={i} fill={i < 2 ? "var(--rose)" : i < 4 ? "var(--amber)" : "var(--violet)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>

        <Panel
          title="Issues"
          subtitle={`${filtered.length} of ${ISSUES.length} shown`}
          action={
            <SegmentedControl
              value={sev}
              onChange={setSev}
              options={[
                { id: "all", label: "All" },
                { id: "error", label: "Errors" },
                { id: "warning", label: "Warnings" },
                { id: "notice", label: "Notices" },
              ]}
            />
          }
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Issue</Th>
                <Th>Category</Th>
                <Th>Severity</Th>
                <Th align="right">Affected URLs</Th>
                <Th align="right">Δ since last crawl</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.title} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">{i.title}</Td>
                  <Td className="text-ink-muted">{i.category}</Td>
                  <Td><SevBadge sev={i.sev} /></Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(i.affected)}</Td>
                  <Td align="right">
                    <span
                      className="text-[11px] font-mono tabular-nums"
                      style={{ color: i.change > 0 ? "var(--rose)" : i.change < 0 ? "var(--signal)" : "var(--ink-subtle)" }}
                    >
                      {i.change > 0 ? "+" : ""}
                      {i.change || "—"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </AppShell>
  );
}

function SevTile({ sev, count, total }: { sev: Sev; count: number; total: number }) {
  const cfg = {
    error: { color: "var(--rose)", Icon: AlertCircle, label: "Errors" },
    warning: { color: "var(--amber)", Icon: AlertTriangle, label: "Warnings" },
    notice: { color: "var(--violet)", Icon: Info, label: "Notices" },
  }[sev];
  const Icon = cfg.Icon;
  return (
    <div className="glass ring-aurora rounded-2xl p-4" style={{ boxShadow: `inset 3px 0 0 ${cfg.color}` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{cfg.label}</span>
        <Icon className="size-4" style={{ color: cfg.color }} />
      </div>
      <p className="text-display text-2xl font-semibold tabular-nums mt-1" style={{ color: cfg.color }}>
        {count}
      </p>
      <p className="text-[11px] text-ink-subtle">{formatNumber(total)} URLs affected</p>
    </div>
  );
}

function SevBadge({ sev }: { sev: Sev }) {
  const cfg = {
    error: { c: "var(--rose)", label: "Error", Icon: AlertCircle },
    warning: { c: "var(--amber)", label: "Warning", Icon: AlertTriangle },
    notice: { c: "var(--violet)", label: "Notice", Icon: Info },
  }[sev];
  const Icon = cfg.Icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono rounded px-1.5 py-0.5"
      style={{ background: `color-mix(in oklab, ${cfg.c} 14%, transparent)`, color: cfg.c }}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}
