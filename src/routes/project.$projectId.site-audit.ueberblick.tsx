import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { ChartTooltip, Panel, ScoreBar, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/site-audit/ueberblick")({
  component: Page,
});

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
    <div className="flex flex-col gap-6">
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
        title="Probleme & Tipps"
        subtitle={`${filtered.length} von ${ISSUES.length} sortiert nach Priorität`}
        action={
          <SegmentedControl
            value={sev}
            onChange={setSev}
            options={[
              { id: "all", label: "Alle" },
              { id: "error", label: "Fehler" },
              { id: "warning", label: "Warnungen" },
              { id: "notice", label: "Hinweise" },
            ]}
          />
        }
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <Th>Issue</Th>
              <Th>Kategorie</Th>
              <Th>Schwere</Th>
              <Th align="right">Betroffene URLs</Th>
              <Th align="right">Δ seit letztem Crawl</Th>
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
  );
}

function SevTile({ sev, count, total }: { sev: Sev; count: number; total: number }) {
  const cfg = {
    error: { color: "var(--rose)", Icon: AlertCircle, label: "Fehler" },
    warning: { color: "var(--amber)", Icon: AlertTriangle, label: "Warnungen" },
    notice: { color: "var(--violet)", Icon: Info, label: "Hinweise" },
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
      <p className="text-[11px] text-ink-subtle">{formatNumber(total)} URLs betroffen</p>
    </div>
  );
}

function SevBadge({ sev }: { sev: Sev }) {
  const cfg = {
    error: { c: "var(--rose)", label: "Fehler", Icon: AlertCircle },
    warning: { c: "var(--amber)", label: "Warnung", Icon: AlertTriangle },
    notice: { c: "var(--violet)", label: "Hinweis", Icon: Info },
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