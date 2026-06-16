import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  Link as LinkIcon,
  Minus,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { KpiCard } from "@/components/app/KpiCard";
import { HealthRing } from "@/components/app/HealthRing";
import {
  getAiMentions,
  getBacklinks,
  getHealthScore,
  getKpis,
  getReferringDomainsGrowth,
  getTopKeywords,
  getTopPages,
  getTrafficSeries,
  type Intent,
  type KeywordRow,
} from "@/lib/mock/seo";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/site-explorer")({
  head: () => ({
    meta: [
      { title: "Site Explorer — Verity" },
      {
        name: "description",
        content:
          "Inspect any domain: organic traffic, keywords, backlinks, top pages and AI mentions in one calm, comparable view.",
      },
    ],
  }),
  component: Page,
});

type Mode = "domain" | "subdomain" | "url" | "prefix";
type TabKey = "overview" | "keywords" | "pages" | "backlinks" | "ai";

const MODES: { id: Mode; label: string }[] = [
  { id: "domain", label: "Domain" },
  { id: "subdomain", label: "Subdomain" },
  { id: "url", label: "Exact URL" },
  { id: "prefix", label: "Prefix" },
];

const TABS: { id: TabKey; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "keywords", label: "Organic Keywords" },
  { id: "pages", label: "Top Pages" },
  { id: "backlinks", label: "Backlinks" },
  { id: "ai", label: "AI Mentions", badge: "AEO" },
];

const COUNTRIES = [
  { code: "US", flag: "🇺🇸", label: "United States" },
  { code: "DE", flag: "🇩🇪", label: "Germany" },
  { code: "GB", flag: "🇬🇧", label: "United Kingdom" },
  { code: "FR", flag: "🇫🇷", label: "France" },
];

const PERIODS = ["7 days", "30 days", "90 days", "12 months"] as const;

function Page() {
  const [domain, setDomain] = useState("verity.app");
  const [draft, setDraft] = useState(domain);
  const [mode, setMode] = useState<Mode>("domain");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("30 days");
  const [tab, setTab] = useState<TabKey>("overview");

  const kpis = useMemo(() => getKpis(domain), [domain]);
  const health = useMemo(() => getHealthScore(domain), [domain]);
  const traffic = useMemo(() => getTrafficSeries(domain, 30), [domain]);
  const keywords = useMemo(() => getTopKeywords(domain, 30), [domain]);
  const pages = useMemo(() => getTopPages(domain, 10), [domain]);
  const backlinks = useMemo(() => getBacklinks(domain, 12), [domain]);
  const ai = useMemo(() => getAiMentions(domain, 6), [domain]);
  const rdGrowth = useMemo(() => getReferringDomainsGrowth(domain), [domain]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.trim()) setDomain(draft.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""));
  }

  return (
    <AppShell
      title="Site Explorer"
      subtitle={`Inspecting ${domain} · ${country.label} · last ${period}`}
    >
      <div className="flex flex-col gap-6">
        {/* ── Toolbar ───────────────────────────────────────────── */}
        <section className="glass ring-aurora rounded-2xl p-4 md:p-5 flex flex-col gap-4">
          <form onSubmit={submit} className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring/40 transition">
              <Globe2 className="size-4 text-ink-subtle" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter a domain, subdomain or URL…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-subtle"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold tracking-tight hover:opacity-90 transition"
              >
                <Search className="size-3.5" /> Analyze
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                value={mode}
                onChange={setMode}
                options={MODES.map((m) => ({ id: m.id, label: m.label }))}
              />
              <Pill onClick={() => {}}>
                <span className="text-base leading-none">{country.flag}</span>
                {country.code}
              </Pill>
              <Pill>{period}</Pill>
              <div className="h-6 w-px bg-border mx-1" />
              <IconButton title="Share">
                <Share2 className="size-4" />
              </IconButton>
              <IconButton title="Export CSV">
                <Download className="size-4" />
              </IconButton>
              <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-muted/70 px-3 py-1.5 text-xs font-medium transition">
                <Sparkles className="size-3.5 text-[color:var(--violet)]" /> AI Summary
              </button>
            </div>
          </form>

          {/* Country / period quick selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle mr-2">
              Country
            </span>
            {COUNTRIES.map((c) => (
              <Chip
                key={c.code}
                active={c.code === country.code}
                onClick={() => setCountry(c)}
              >
                <span className="text-sm leading-none">{c.flag}</span>
                {c.code}
              </Chip>
            ))}
            <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle mx-2">
              Period
            </span>
            {PERIODS.map((p) => (
              <Chip key={p} active={p === period} onClick={() => setPeriod(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </section>

        {/* ── KPI Strip ─────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map((k) => (
            <KpiCard key={k.label} kpi={k} />
          ))}
        </section>

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition",
                  active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  {t.label}
                  {t.badge && (
                    <span className="rounded-md bg-[color:var(--signal)]/15 text-[10px] tracking-wide px-1.5 py-0.5 font-mono text-[color:var(--signal-foreground)]/80">
                      {t.badge}
                    </span>
                  )}
                </span>
                {active && (
                  <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ───────────────────────────────────────── */}
        {tab === "overview" && (
          <OverviewTab
            traffic={traffic}
            keywords={keywords}
            pages={pages}
            health={health}
            rdGrowth={rdGrowth}
            onSeeKeywords={() => setTab("keywords")}
            onSeePages={() => setTab("pages")}
            onSeeBacklinks={() => setTab("backlinks")}
          />
        )}
        {tab === "keywords" && <KeywordsTab rows={keywords} />}
        {tab === "pages" && <PagesTab rows={pages} />}
        {tab === "backlinks" && <BacklinksTab rows={backlinks} growth={rdGrowth} />}
        {tab === "ai" && <AiTab items={ai} domain={domain} />}
      </div>
    </AppShell>
  );
}

/* ─── Overview ──────────────────────────────────────────────── */

function OverviewTab({
  traffic,
  keywords,
  pages,
  health,
  rdGrowth,
  onSeeKeywords,
  onSeePages,
  onSeeBacklinks,
}: {
  traffic: ReturnType<typeof getTrafficSeries>;
  keywords: KeywordRow[];
  pages: ReturnType<typeof getTopPages>;
  health: ReturnType<typeof getHealthScore>;
  rdGrowth: ReturnType<typeof getReferringDomainsGrowth>;
  onSeeKeywords: () => void;
  onSeePages: () => void;
  onSeeBacklinks: () => void;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Traffic chart */}
      <Panel className="xl:col-span-2" title="Organic Traffic" subtitle="Current period vs. previous">
        <div className="h-72 -mx-2">
          <ResponsiveContainer>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="cur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                tickFormatter={(v) => formatNumber(Number(v))}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--violet)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#prev)"
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="var(--signal)"
                strokeWidth={2.5}
                fill="url(#cur)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-mono text-ink-subtle pt-2 pl-2">
          <Legend color="var(--signal)" label="Current" />
          <Legend color="var(--violet)" label="Previous" dashed />
        </div>
      </Panel>

      {/* Health */}
      <Panel
        title="Unified Health Score"
        subtitle="Tech · Content · Authority · AEO"
        badge="NEW"
      >
        <div className="flex flex-col items-center gap-4">
          <HealthRing score={health.overall} />
          <div className="w-full flex flex-col gap-2">
            {health.breakdown.map((b) => (
              <ScoreBar key={b.label} label={b.label} value={b.score} />
            ))}
          </div>
        </div>
      </Panel>

      {/* Top keywords */}
      <Panel
        title="Top Organic Keywords"
        subtitle={`${keywords.length} ranked · sorted by traffic`}
        action={<PanelLink onClick={onSeeKeywords}>View all keywords →</PanelLink>}
      >
        <ul className="flex flex-col">
          {keywords.slice(0, 6).map((k, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0"
            >
              <PositionBadge pos={k.position} delta={k.positionDelta} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{k.keyword}</p>
                <p className="text-[11px] text-ink-subtle truncate">{k.url}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono">{formatNumber(k.traffic)}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-subtle">traffic</p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Top pages */}
      <Panel
        title="Top Pages"
        subtitle="Driving most organic traffic"
        action={<PanelLink onClick={onSeePages}>View all pages →</PanelLink>}
      >
        <ul className="flex flex-col">
          {pages.slice(0, 5).map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0"
            >
              <span className="text-[10px] font-mono w-6 text-ink-subtle text-right">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.url}</p>
                <p className="text-[11px] text-ink-subtle truncate">
                  {p.topKeyword} · {formatNumber(p.keywords)} kw
                </p>
              </div>
              <div className="text-right shrink-0 w-24">
                <p className="text-sm font-mono">{formatNumber(p.traffic)}</p>
                <ShareBar share={p.trafficShare} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Backlink growth */}
      <Panel
        title="Referring Domains Growth"
        subtitle="Last 30 days"
        action={<PanelLink onClick={onSeeBacklinks}>View all backlinks →</PanelLink>}
        className="xl:col-span-3"
      >
        <div className="h-56 -mx-2">
          <ResponsiveContainer>
            <BarChart data={rdGrowth}>
              <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--ink-subtle)" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="gained" stackId="x" fill="var(--signal)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="lost" stackId="x" fill="var(--rose)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-mono text-ink-subtle pt-2 pl-2">
          <Legend color="var(--signal)" label="Gained" />
          <Legend color="var(--rose)" label="Lost" />
        </div>
      </Panel>
    </div>
  );
}

/* ─── Keywords tab ──────────────────────────────────────────── */

function KeywordsTab({ rows }: { rows: KeywordRow[] }) {
  const [intent, setIntent] = useState<Intent | "all">("all");
  const [feature, setFeature] = useState<string | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) => {
    if (intent !== "all" && r.intent !== intent) return false;
    if (feature !== "all" && !r.serpFeatures.includes(feature)) return false;
    if (query && !r.keyword.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const intents: (Intent | "all")[] = ["all", "informational", "commercial", "transactional", "navigational"];
  const features = ["all", "AI Overview", "Featured Snippet", "People Also Ask", "Video", "Sitelinks"];

  return (
    <Panel
      title={`Organic Keywords · ${filtered.length}`}
      subtitle="Filter by intent, SERP feature or text"
    >
      <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5">
          <Filter className="size-3.5 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter keywords…"
            className="bg-transparent outline-none text-sm w-44 placeholder:text-ink-subtle"
          />
        </div>
        <Select label="Intent" value={intent} onChange={(v) => setIntent(v as Intent | "all")} options={intents} />
        <Select label="SERP" value={feature} onChange={setFeature} options={features} />
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">
              <Th>Keyword</Th>
              <Th align="right">Pos.</Th>
              <Th align="right">Δ</Th>
              <Th align="right">Volume</Th>
              <Th align="right">KD</Th>
              <Th align="right">CPC</Th>
              <Th align="right">Traffic</Th>
              <Th>Intent</Th>
              <Th>SERP</Th>
              <Th>URL</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={i}
                className="border-t border-border/60 hover:bg-muted/40 transition-colors"
              >
                <Td className="font-medium">{r.keyword}</Td>
                <Td align="right" className="font-mono tabular-nums">{r.position}</Td>
                <Td align="right">
                  <DeltaPill value={r.positionDelta} inverse />
                </Td>
                <Td align="right" className="font-mono tabular-nums">{formatNumber(r.volume)}</Td>
                <Td align="right">
                  <KdBar value={r.kd} />
                </Td>
                <Td align="right" className="font-mono tabular-nums">${r.cpc.toFixed(2)}</Td>
                <Td align="right" className="font-mono tabular-nums">{formatNumber(r.traffic)}</Td>
                <Td><IntentBadge intent={r.intent} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {r.serpFeatures.length === 0 && <span className="text-ink-subtle">—</span>}
                    {r.serpFeatures.map((f) => (
                      <span key={f} className="text-[10px] rounded px-1.5 py-0.5 bg-muted text-ink-muted">
                        {f}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td className="text-ink-subtle truncate max-w-[220px]">{r.url}</Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-sm text-ink-subtle">
                  No keywords match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ─── Pages tab ─────────────────────────────────────────────── */

function PagesTab({ rows }: { rows: ReturnType<typeof getTopPages> }) {
  return (
    <Panel title={`Top Pages · ${rows.length}`} subtitle="Largest traffic contributors">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">
              <Th>URL</Th>
              <Th>Top Keyword</Th>
              <Th align="right">Keywords</Th>
              <Th align="right">Traffic</Th>
              <Th align="right">Share</Th>
              <Th align="right">Value</Th>
              <Th align="right"></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border/60 hover:bg-muted/40 transition-colors">
                <Td className="font-medium truncate max-w-[320px]">{r.url}</Td>
                <Td className="text-ink-muted">{r.topKeyword}</Td>
                <Td align="right" className="font-mono">{formatNumber(r.keywords)}</Td>
                <Td align="right" className="font-mono">{formatNumber(r.traffic)}</Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-2">
                    <ShareBar share={r.trafficShare} className="w-24" />
                    <span className="font-mono w-10 text-right">{r.trafficShare}%</span>
                  </div>
                </Td>
                <Td align="right" className="font-mono">${formatNumber(r.value)}</Td>
                <Td align="right">
                  <a className="inline-flex items-center gap-1 text-ink-subtle hover:text-foreground transition" href="#" onClick={(e) => e.preventDefault()}>
                    <ExternalLink className="size-3.5" />
                  </a>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ─── Backlinks tab ─────────────────────────────────────────── */

function BacklinksTab({
  rows,
  growth,
}: {
  rows: ReturnType<typeof getBacklinks>;
  growth: ReturnType<typeof getReferringDomainsGrowth>;
}) {
  const total = growth.at(-1)?.total ?? 0;
  const delta = (growth.at(-1)?.total ?? 0) - (growth.at(0)?.total ?? 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Panel title="Referring Domains" subtitle="Total · last 30d">
        <div className="flex items-baseline gap-2">
          <span className="text-display text-3xl font-semibold tabular-nums">
            {formatNumber(total)}
          </span>
          <DeltaPill value={(delta / (total || 1)) * 100} />
        </div>
        <div className="h-32 -mx-2 mt-3">
          <ResponsiveContainer>
            <AreaChart data={growth}>
              <defs>
                <linearGradient id="rd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area dataKey="total" stroke="var(--signal)" strokeWidth={2} fill="url(#rd)" />
              <Tooltip content={<ChartTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Anchor Mix" subtitle="Most-used inbound anchors">
        <ul className="flex flex-col gap-2">
          {anchorMix(rows).map((a) => (
            <li key={a.text} className="flex items-center gap-3">
              <div className="flex-1 min-w-0 text-sm truncate" title={a.text}>
                {a.text}
              </div>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${a.pct}%`, background: "linear-gradient(90deg, var(--signal), var(--violet))" }}
                />
              </div>
              <span className="font-mono text-xs text-ink-subtle w-10 text-right">{a.pct}%</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Toxic Score Average" subtitle="Lower is better">
        <div className="flex items-baseline gap-2">
          <span className="text-display text-3xl font-semibold tabular-nums">
            {(rows.reduce((s, r) => s + r.toxicScore, 0) / rows.length).toFixed(1)}
          </span>
          <span className="text-xs text-ink-subtle">/ 100</span>
        </div>
        <p className="text-xs text-ink-muted mt-2">
          {rows.filter((r) => r.toxicScore > 12).length} domains flagged for review.
        </p>
        <div className="mt-4 grid grid-cols-10 gap-1">
          {rows.map((r, i) => (
            <span
              key={i}
              title={`${r.domain} · ${r.toxicScore}`}
              className="h-6 rounded"
              style={{
                background:
                  r.toxicScore > 12
                    ? "color-mix(in oklab, var(--rose) 80%, transparent)"
                    : r.toxicScore > 6
                    ? "color-mix(in oklab, var(--amber) 70%, transparent)"
                    : "color-mix(in oklab, var(--signal) 70%, transparent)",
              }}
            />
          ))}
        </div>
      </Panel>

      <Panel title={`Backlinks · ${rows.length}`} subtitle="Top referring domains by DR" className="xl:col-span-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">
                <Th>Domain</Th>
                <Th align="right">DR</Th>
                <Th align="right">Traffic</Th>
                <Th>Anchor</Th>
                <Th>Type</Th>
                <Th>First Seen</Th>
                <Th align="right">Toxic</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border/60 hover:bg-muted/40 transition-colors">
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <LinkIcon className="size-3.5 text-ink-subtle" />
                      {r.domain}
                    </span>
                  </Td>
                  <Td align="right">
                    <DrBadge dr={r.dr} />
                  </Td>
                  <Td align="right" className="font-mono">{formatNumber(r.traffic)}</Td>
                  <Td className="text-ink-muted">"{r.anchorText}"</Td>
                  <Td>
                    <span
                      className={cn(
                        "text-[10px] rounded px-1.5 py-0.5 font-mono",
                        r.type === "dofollow"
                          ? "bg-[color:var(--signal)]/15 text-[color:var(--signal-foreground)]/80"
                          : r.type === "nofollow"
                          ? "bg-muted text-ink-muted"
                          : "bg-[color:var(--amber)]/15 text-[color:var(--amber)]",
                      )}
                    >
                      {r.type}
                    </span>
                  </Td>
                  <Td className="text-ink-subtle">{r.firstSeen}</Td>
                  <Td align="right">
                    <span
                      className={cn(
                        "font-mono tabular-nums",
                        r.toxicScore > 12
                          ? "text-[color:var(--rose)]"
                          : r.toxicScore > 6
                          ? "text-[color:var(--amber)]"
                          : "text-ink-muted",
                      )}
                    >
                      {r.toxicScore}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ─── AI tab ────────────────────────────────────────────────── */

function AiTab({
  items,
  domain,
}: {
  items: ReturnType<typeof getAiMentions>;
  domain: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel
        title="AI Mentions"
        subtitle={`How AI engines cite ${domain}`}
        badge="AEO"
        className="lg:col-span-2"
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((m, i) => (
            <li
              key={i}
              className="rounded-xl border border-border bg-surface-2 p-4 flex flex-col gap-2 hover:bg-muted/60 transition"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-medium">
                  <Sparkles className="size-3.5 text-[color:var(--violet)]" />
                  {m.source}
                </span>
                <span className="text-[10px] text-mono text-ink-subtle uppercase">
                  {m.hoursAgo}h ago
                </span>
              </div>
              <p className="text-sm font-medium">"{m.query}"</p>
              <p className="text-sm text-ink-muted leading-relaxed">{m.snippet}</p>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={cn(
                    "text-[10px] rounded px-1.5 py-0.5 font-mono uppercase tracking-wider",
                    m.sentiment === "positive"
                      ? "bg-[color:var(--signal)]/15 text-[color:var(--signal-foreground)]/80"
                      : m.sentiment === "negative"
                      ? "bg-[color:var(--rose)]/15 text-[color:var(--rose)]"
                      : "bg-muted text-ink-muted",
                  )}
                >
                  {m.sentiment}
                </span>
                <span className="text-[10px] rounded px-1.5 py-0.5 font-mono uppercase tracking-wider bg-muted text-ink-muted">
                  {m.citationType}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ─── Helpers / atoms ───────────────────────────────────────── */

function Panel({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass ring-aurora rounded-2xl p-5", className)}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-display text-base font-semibold flex items-center gap-2">
            {title}
            {badge && (
              <span className="rounded-md bg-[color:var(--signal)]/15 text-[10px] tracking-wide px-1.5 py-0.5 font-mono text-[color:var(--signal-foreground)]/80">
                {badge}
              </span>
            )}
          </h3>
          {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function PanelLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-mono uppercase tracking-widest text-ink-muted hover:text-foreground transition"
    >
      {children}
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition",
            value === o.id
              ? "bg-background text-foreground shadow-sm"
              : "text-ink-muted hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Pill({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-muted/70 px-2.5 py-1.5 text-xs font-medium transition"
    >
      {children}
    </button>
  );
}

function IconButton({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="size-8 grid place-items-center rounded-lg border border-border bg-surface-2 hover:bg-muted/70 transition"
    >
      {children}
    </button>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition border",
        active
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-surface-2 text-ink-muted hover:text-foreground hover:bg-muted/70",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs">
      <span className="text-ink-subtle">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none text-foreground font-medium cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background text-foreground">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Th({
  children,
  align = "left",
}: {
  children?: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 font-normal whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  className,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

function PositionBadge({ pos, delta }: { pos: number; delta: number }) {
  const tone = pos <= 3 ? "var(--signal)" : pos <= 10 ? "var(--violet)" : "var(--ink-subtle)";
  return (
    <div className="flex flex-col items-center w-9">
      <span
        className="text-mono text-xs font-semibold rounded-md px-1.5 py-0.5"
        style={{ background: `color-mix(in oklab, ${tone} 15%, transparent)`, color: tone }}
      >
        {pos}
      </span>
      <DeltaTiny value={delta} inverse />
    </div>
  );
}

function DeltaTiny({ value, inverse }: { value: number; inverse?: boolean }) {
  if (!value) return <span className="text-[10px] text-ink-subtle">—</span>;
  const isGood = inverse ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className="text-[10px] font-mono inline-flex items-center"
      style={{ color: isGood ? "var(--signal)" : "var(--rose)" }}
    >
      <Icon className="size-2.5" />
      {Math.abs(value)}
    </span>
  );
}

function DeltaPill({ value, inverse }: { value: number; inverse?: boolean }) {
  if (!Math.round(value * 10)) {
    return (
      <span className="inline-flex items-center text-[11px] font-mono text-ink-subtle">
        <Minus className="size-3 mr-0.5" /> 0
      </span>
    );
  }
  const isGood = inverse ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded"
      style={{
        background: `color-mix(in oklab, ${isGood ? "var(--signal)" : "var(--rose)"} 15%, transparent)`,
        color: isGood ? "var(--signal-foreground)" : "var(--rose)",
      }}
    >
      <Icon className="size-3" />
      {Math.abs(value).toFixed(1)}
    </span>
  );
}

function KdBar({ value }: { value: number }) {
  const color =
    value < 30 ? "var(--signal)" : value < 60 ? "var(--amber)" : "var(--rose)";
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono tabular-nums text-xs w-6 text-right">{value}</span>
    </div>
  );
}

function IntentBadge({ intent }: { intent: Intent }) {
  const map: Record<Intent, { c: string; label: string }> = {
    informational: { c: "var(--chart-5)", label: "I" },
    commercial: { c: "var(--violet)", label: "C" },
    transactional: { c: "var(--signal)", label: "T" },
    navigational: { c: "var(--amber)", label: "N" },
  };
  const v = map[intent];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className="size-4 grid place-items-center rounded text-[10px] font-mono font-semibold"
        style={{ background: `color-mix(in oklab, ${v.c} 18%, transparent)`, color: v.c }}
      >
        {v.label}
      </span>
      <span className="text-ink-muted capitalize">{intent}</span>
    </span>
  );
}

function DrBadge({ dr }: { dr: number }) {
  const c = dr >= 80 ? "var(--signal)" : dr >= 60 ? "var(--violet)" : dr >= 40 ? "var(--amber)" : "var(--ink-subtle)";
  return (
    <span
      className="font-mono tabular-nums text-xs font-semibold rounded-md px-2 py-0.5"
      style={{ background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c }}
    >
      {dr}
    </span>
  );
}

function ShareBar({ share, className }: { share: number; className?: string }) {
  return (
    <div className={cn("h-1 rounded-full bg-muted overflow-hidden", className)}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, share)}%`, background: "linear-gradient(90deg, var(--signal), var(--violet))" }}
      />
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "var(--signal)" : value >= 65 ? "var(--violet)" : value >= 50 ? "var(--amber)" : "var(--rose)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono tabular-nums text-xs w-7 text-right">{value}</span>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-4 h-0.5"
        style={{
          background: color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      {label}
    </span>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs">
      <p className="font-mono text-ink-subtle mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-ink-muted">{p.dataKey}</span>
          <span className="font-mono tabular-nums ml-auto">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function anchorMix(rows: ReturnType<typeof getBacklinks>) {
  const map = new Map<string, number>();
  rows.forEach((r) => map.set(r.anchorText, (map.get(r.anchorText) ?? 0) + 1));
  const total = rows.length;
  return [...map.entries()]
    .map(([text, n]) => ({ text, pct: Math.round((n / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
}
