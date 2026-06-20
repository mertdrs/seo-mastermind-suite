import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, AlertTriangle, ChevronRight, Info } from "lucide-react";
import { ChartTooltip, Panel, ScoreBar, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { StatusBadge, TrendDelta } from "@/components/app/V2";
import { formatNumber } from "@/lib/format";
import { SEVERITY_TOKEN, type Severity as TokenSeverity } from "@/lib/tokens";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/project/$projectId/site-audit/ueberblick")({
  component: Page,
});

type Sev = "error" | "warning" | "notice";
const SEV_TO_TOKEN: Record<Sev, TokenSeverity> = { error: "error", warning: "warning", notice: "info" };

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
  const [drill, setDrill] = useState<typeof ISSUES[number] | null>(null);
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
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr
                key={i.title}
                onClick={() => setDrill(i)}
                className="border-b border-border/60 hover:bg-muted/40 cursor-pointer"
              >
                <Td className="font-medium">{i.title}</Td>
                <Td className="text-ink-muted">{i.category}</Td>
                <Td><SevBadge sev={i.sev} /></Td>
                <Td align="right" className="font-mono tabular-nums">{formatNumber(i.affected)}</Td>
                <Td align="right">
                  <TrendDelta value={i.change} format="absolute" metricKey="affectedUrls" />
                </Td>
                <Td align="right">
                  <ChevronRight className="size-3.5 text-ink-subtle inline" />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <IssueDrillDown issue={drill} onOpenChange={(o) => !o && setDrill(null)} />
    </div>
  );
}

function SevTile({ sev, count, total }: { sev: Sev; count: number; total: number }) {
  const cfgMap = {
    error: { token: SEVERITY_TOKEN.error, Icon: AlertCircle, label: "Fehler" },
    warning: { token: SEVERITY_TOKEN.warning, Icon: AlertTriangle, label: "Warnungen" },
    notice: { token: SEVERITY_TOKEN.info, Icon: Info, label: "Hinweise" },
  } as const;
  const cfg = cfgMap[sev];
  const Icon = cfg.Icon;
  return (
    <div className="glass ring-aurora rounded-2xl p-4" style={{ boxShadow: `inset 3px 0 0 ${cfg.token.fg}` }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{cfg.label}</span>
        <Icon className="size-4" style={{ color: cfg.token.fg }} />
      </div>
      <p className="text-display text-2xl font-semibold tabular-nums mt-1" style={{ color: cfg.token.fg }}>
        {count}
      </p>
      <p className="text-[11px] text-ink-subtle">{formatNumber(total)} URLs betroffen</p>
    </div>
  );
}

function SevBadge({ sev }: { sev: Sev }) {
  const labelMap = { error: "Fehler", warning: "Warnung", notice: "Hinweis" } as const;
  return <StatusBadge severity={SEV_TO_TOKEN[sev]} label={labelMap[sev]} size="sm" />;
}

/* ---- Drill-down: betroffene URLs ---- */

function IssueDrillDown({
  issue,
  onOpenChange,
}: {
  issue: typeof ISSUES[number] | null;
  onOpenChange: (o: boolean) => void;
}) {
  const urls = useMemo(() => {
    if (!issue) return [];
    // Mock-Daten — deterministisch nach Issue-Titel
    const seed = issue.title.length;
    const slugs = [
      "/", "/pricing", "/blog/seo-ai", "/blog/ranking-2026", "/features/audit",
      "/integrations/slack", "/docs/getting-started", "/about", "/contact",
      "/changelog/v3", "/legal/imprint", "/de/preise", "/de/blog/ranking",
    ];
    return Array.from({ length: Math.min(issue.affected, 12) }, (_, i) => {
      const path = slugs[(i + seed) % slugs.length]!;
      return {
        url: `https://verity.app${path}`,
        problem: issue.title,
        hint: hintFor(issue),
      };
    });
  }, [issue]);
  return (
    <Dialog open={!!issue} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {issue && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <SevBadge sev={issue.sev} />
                <span>{issue.title}</span>
              </DialogTitle>
              <p className="text-xs text-ink-muted mt-1">
                {issue.category} · {formatNumber(issue.affected)} betroffene URLs · zeigt erste {urls.length}
              </p>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-border">
                    <Th>URL</Th>
                    <Th>Problem</Th>
                    <Th>Quick-Fix</Th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((r) => (
                    <tr key={r.url} className="border-b border-border/60">
                      <Td>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] font-mono hover:underline"
                          style={{ color: "var(--status-info)" }}
                        >
                          {r.url.replace("https://", "")}
                        </a>
                      </Td>
                      <Td className="text-ink-muted text-xs">{r.problem}</Td>
                      <Td className="text-xs">{r.hint}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function hintFor(issue: typeof ISSUES[number]): string {
  if (issue.title.includes("4xx")) return "Redirect (301) auf passende URL setzen.";
  if (issue.title.includes("Broken internal")) return "Link entfernen oder Ziel reparieren.";
  if (issue.title.includes("canonical")) return "<link rel=canonical> auf Self-URL ergänzen.";
  if (issue.title.includes("LCP")) return "Hero-Image als WebP & preload, Render-Blocker entfernen.";
  if (issue.title.includes("Duplicate title")) return "Eindeutigen <title> je Seite vergeben.";
  if (issue.title.includes("alt text")) return "Beschreibende alt-Texte oder alt=\"\" für deko Bilder.";
  if (issue.title.includes("H1")) return "Genau ein eindeutiges <h1> pro Seite.";
  if (issue.title.includes("Thin")) return "Content auf ≥ 300 Wörter ausbauen oder noindex.";
  if (issue.title.includes("meta descriptions")) return "Meta Description auf ≤ 155 Zeichen kürzen.";
  if (issue.title.includes("robots.txt")) return "Disallow-Regel prüfen, ggf. Allow setzen.";
  if (issue.title.includes("Mixed content")) return "Assets auf HTTPS umstellen.";
  if (issue.title.includes("structured data")) return "JSON-LD Schema ergänzen (Article, FAQ, Product).";
  return "Detail-Empfehlung folgt nach erneuter Analyse.";
}