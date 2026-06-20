import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink, HelpCircle, Search, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  ChartTooltip,
  Chip,
  IconButton,
  KdBar,
  Panel,
  Pill,
  SegmentedControl,
  Td,
  Th,
} from "@/components/app/Atoms";
import { MetricCard, TrackKeywordButton, TrendDelta } from "@/components/app/V2";
import { seriesColor } from "@/lib/tokens";
import { formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/keywords")({
  head: () => ({
    meta: [
      { title: "Keywords Explorer — Verity" },
      { name: "description", content: "Find, cluster and prioritise the keywords worth ranking for." },
    ],
  }),
  component: Page,
});

type Tab = "overview" | "variations" | "questions" | "related" | "serp";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "variations", label: "Keyword Variations" },
  { id: "questions", label: "Questions" },
  { id: "related", label: "Related" },
  { id: "serp", label: "SERP Analysis" },
];

const COUNTRIES = [
  { code: "US", flag: "🇺🇸" },
  { code: "DE", flag: "🇩🇪" },
  { code: "GB", flag: "🇬🇧" },
  { code: "FR", flag: "🇫🇷" },
];

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(keyword: string) {
  const r = seed(keyword);
  const volume = Math.round(800 + r() * 78_000);
  const trend = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
    volume: Math.round(volume * (0.7 + r() * 0.6)),
  }));
  const variations = Array.from({ length: 14 }, (_, i) => ({
    keyword: `${["best","top","cheap","free","how to use","alternatives to","compare"][i % 7]} ${keyword}`,
    volume: Math.round(50 + r() * volume * 0.7),
    kd: Math.round(8 + r() * 80),
    cpc: Number((r() * 9).toFixed(2)),
    intent: ["informational","commercial","transactional","navigational"][Math.floor(r() * 4)]!,
  })).sort((a, b) => b.volume - a.volume);
  const questions = [
    `What is ${keyword}?`,
    `How does ${keyword} work?`,
    `Why use ${keyword} in 2026?`,
    `Is ${keyword} worth it?`,
    `How much does ${keyword} cost?`,
    `What are ${keyword} alternatives?`,
    `Can ${keyword} be free?`,
  ].map((q) => ({
    q,
    volume: Math.round(40 + r() * 6_000),
    kd: Math.round(5 + r() * 60),
  }));
  const related = Array.from({ length: 10 }, (_, i) => ({
    keyword: `${keyword} ${["guide","tutorial","2026","tools","reddit","vs notion","examples","pricing","review","template"][i]}`,
    volume: Math.round(80 + r() * 18_000),
    similarity: Math.round(40 + r() * 55),
  })).sort((a, b) => b.similarity - a.similarity);
  const serp = [
    "ahrefs.com","moz.com","semrush.com","backlinko.com","searchengineland.com",
    "hubspot.com","neilpatel.com","wordstream.com","yoast.com","contentking.com",
  ].map((d, i) => ({
    pos: i + 1,
    domain: d,
    dr: Math.round(60 + r() * 32),
    traffic: Math.round(80 + r() * 8_000),
    backlinks: Math.round(20 + r() * 4_000),
  }));
  const intentRaw = [
    { name: "Informational", value: Math.round(40 + r() * 40) },
    { name: "Commercial", value: Math.round(15 + r() * 30) },
    { name: "Transactional", value: Math.round(5 + r() * 15) },
    { name: "Navigational", value: Math.round(3 + r() * 10) },
  ];
  const intentSum = intentRaw.reduce((s, x) => s + x.value, 0);
  const intentDist = intentRaw.map((x, i) => ({
    name: x.name,
    value: Math.round((x.value / intentSum) * 100),
    color: seriesColor(i),
  }));
  // Rundungs-Korrektur, damit Summe = 100
  const intentRounded = intentDist.reduce((s, x) => s + x.value, 0);
  if (intentDist[0] && intentRounded !== 100) intentDist[0].value += 100 - intentRounded;
  const serpFeatures = [
    { name: "AI Overview", value: Math.round(20 + r() * 70) },
    { name: "Snippet", value: Math.round(10 + r() * 60) },
    { name: "PAA", value: Math.round(10 + r() * 80) },
    { name: "Video", value: Math.round(5 + r() * 40) },
    { name: "Image Pack", value: Math.round(5 + r() * 35) },
    { name: "Sitelinks", value: Math.round(5 + r() * 25) },
  ];
  return {
    volume,
    kd: Math.round(20 + r() * 70),
    cpc: Number((r() * 8 + 0.4).toFixed(2)),
    competition: Number((r() * 0.9 + 0.1).toFixed(2)),
    globalVolume: Math.round(volume * (1.8 + r())),
    trafficPotential: Math.round(volume * 0.35),
    trend,
    variations,
    questions,
    related,
    serp,
    intentDist,
    serpFeatures,
    delta: Number(((r() - 0.4) * 30).toFixed(1)),
  };
}

function Page() {
  const [draft, setDraft] = useState("ai writing tools");
  const [keyword, setKeyword] = useState(draft);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [tab, setTab] = useState<Tab>("overview");
  const d = useMemo(() => generate(keyword), [keyword]);

  return (
    <AppShell title="Keywords Explorer" subtitle={`"${keyword}" · ${country.code} · last 12 months`}>
      <div className="flex flex-col gap-6">
        {/* Toolbar */}
        <section className="glass ring-aurora rounded-2xl p-4 md:p-5 flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) setKeyword(draft.trim().toLowerCase());
            }}
            className="flex flex-col lg:flex-row gap-3"
          >
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring/40">
              <Search className="size-4 text-ink-subtle" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Enter a seed keyword…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-subtle"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90"
              >
                Analyze
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {COUNTRIES.map((c) => (
                <Chip key={c.code} active={c.code === country.code} onClick={() => setCountry(c)}>
                  <span>{c.flag}</span>
                  {c.code}
                </Chip>
              ))}
              <div className="h-6 w-px bg-border mx-1" />
              <Pill>
                <Sparkles className="size-3.5 text-[color:var(--violet)]" />
                Cluster
              </Pill>
            </div>
          </form>
        </section>

        {/* KPI strip — alle Karten über zentrale MetricCard */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard label="Volumen" value={formatNumber(d.volume)} unit="Suchen / Monat" metricKey="searchVolume" delta={{ value: d.delta }} />
          <MetricCard label="Keyword Difficulty" value={`${d.kd}/100`} metricKey="keywordDifficulty" />
          <MetricCard label="CPC" value={formatCurrency(d.cpc)} unit="Ø Paid" metricKey="cpc" />
          <MetricCard label="Competition" value={d.competition.toFixed(2)} unit="Paid-Dichte" metricKey="competition" />
          <MetricCard label="Global Volume" value={formatNumber(d.globalVolume)} unit="alle Märkte" metricKey="globalVolume" />
          <MetricCard label="Traffic-Potenzial" value={formatNumber(d.trafficPotential)} unit="bei Rang 1" metricKey="trafficPotential" />
        </section>

        {/* Track action für aktuelles Keyword */}
        <section className="-mt-2 flex items-center gap-3 text-xs text-ink-muted">
          <span>Aktuelles Keyword:</span>
          <span className="font-medium text-foreground">„{keyword}"</span>
          <TrackKeywordButton keyword={keyword} source="keywordsExplorer" size="md" />
        </section>

        {/* Tabs */}
        <nav className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative px-3 py-2.5 text-sm font-medium whitespace-nowrap",
                  active ? "text-foreground" : "text-ink-muted hover:text-foreground",
                )}
              >
                {t.label}
                {active && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-foreground" />}
              </button>
            );
          })}
        </nav>

        {tab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Panel title="Search Volume" subtitle="Monthly trend, last 12 months" className="xl:col-span-2">
              <div className="h-64 -mx-2">
                <ResponsiveContainer>
                  <AreaChart data={d.trend}>
                    <defs>
                      <linearGradient id="kw-vol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-subtle)" }} tickFormatter={(v) => formatNumber(v)} axisLine={false} tickLine={false} width={42} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="volume" stroke="var(--signal)" strokeWidth={2.5} fill="url(#kw-vol)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Intent Mix">
              <div className="h-40">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={d.intentDist} dataKey="value" innerRadius={36} outerRadius={62} stroke="none" paddingAngle={2}>
                      {d.intentDist.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {d.intentDist.map((i) => (
                  <li key={i.name} className="flex items-center gap-2 text-xs">
                    <span className="size-2 rounded-full" style={{ background: i.color }} />
                    <span className="text-ink-muted flex-1">{i.name}</span>
                    <span className="font-mono tabular-nums">{i.value}%</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="SERP Features" subtitle="Which features appear on the SERP" className="xl:col-span-3">
              <div className="h-48 -mx-2">
                <ResponsiveContainer>
                  <BarChart data={d.serpFeatures}>
                    <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--series-1)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        )}

        {tab === "variations" && (
          <Panel title="Keyword Variations" subtitle={`${d.variations.length} variants found`} action={<Pill>Export CSV</Pill>}>
            <KwTable rows={d.variations} />
          </Panel>
        )}

        {tab === "questions" && (
          <div className="grid md:grid-cols-2 gap-3">
            {d.questions.map((q) => (
              <div key={q.q} className="glass ring-aurora rounded-2xl p-4 flex items-start gap-3">
                <HelpCircle className="size-4 mt-1 text-[color:var(--violet)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{q.q}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-mono text-ink-subtle">
                    <span>VOL <span className="text-foreground font-semibold">{formatNumber(q.volume)}</span></span>
                    <span>KD <span className="text-foreground font-semibold">{q.kd}</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "related" && (
          <Panel title="Related Keywords" subtitle="Sorted by topical similarity">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <Th>Keyword</Th>
                  <Th align="right">Similarity</Th>
                  <Th align="right">Volume</Th>
                </tr>
              </thead>
              <tbody>
                {d.related.map((r) => (
                  <tr key={r.keyword} className="border-b border-border/60 hover:bg-muted/40">
                    <Td>{r.keyword}</Td>
                    <Td align="right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.similarity}%`, background: "var(--violet)" }} />
                        </div>
                        <span className="font-mono tabular-nums text-xs w-8">{r.similarity}%</span>
                      </div>
                    </Td>
                    <Td align="right" className="font-mono tabular-nums">{formatNumber(r.volume)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}

        {tab === "serp" && (
          <Panel title="SERP Top 10" subtitle={`Who currently ranks for "${keyword}"`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <Th>#</Th>
                  <Th>Domain</Th>
                  <Th align="right">DR</Th>
                  <Th align="right">Traffic</Th>
                  <Th align="right">Backlinks</Th>
                  <Th align="right"></Th>
                </tr>
              </thead>
              <tbody>
                {d.serp.map((row) => (
                  <tr key={row.domain} className="border-b border-border/60 hover:bg-muted/40">
                    <Td className="font-mono text-ink-subtle">{String(row.pos).padStart(2, "0")}</Td>
                    <Td className="font-medium">{row.domain}</Td>
                    <Td align="right" className="font-mono tabular-nums">{row.dr}</Td>
                    <Td align="right" className="font-mono tabular-nums">{formatNumber(row.traffic)}</Td>
                    <Td align="right" className="font-mono tabular-nums">{formatNumber(row.backlinks)}</Td>
                    <Td align="right">
                      <IconButton title="Open">
                        <ExternalLink className="size-3.5" />
                      </IconButton>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function KwTable({ rows }: { rows: { keyword: string; volume: number; kd: number; cpc: number; intent: string }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <Th>Keyword</Th>
          <Th>Intent</Th>
          <Th align="right">Volume</Th>
          <Th align="right">KD</Th>
          <Th align="right">CPC</Th>
          <Th></Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.keyword} className="border-b border-border/60 hover:bg-muted/40">
            <Td className="font-medium">{r.keyword}</Td>
            <Td><span className="text-xs text-ink-muted capitalize">{r.intent}</span></Td>
            <Td align="right" className="font-mono tabular-nums">{formatNumber(r.volume)}</Td>
            <Td align="right"><KdBar value={r.kd} /></Td>
            <Td align="right" className="font-mono tabular-nums">{formatCurrency(r.cpc)}</Td>
            <Td align="right">
              <TrackKeywordButton keyword={r.keyword} source="keywordsExplorer" />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
