import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, Panel } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { PageTabs, FilterBar, EmptyState } from "@/components/app/V2Shared";
import { getAiMentions } from "@/lib/mock/seo";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/brand-radar")({
  head: () => ({
    meta: [
      { title: "AI Visibility — Verity" },
      { name: "description", content: "Track how AI engines cite, summarise and rank your brand." },
    ],
  }),
  component: Page,
});

// Feste, wiedererkennbare Farb-Zuordnung je Engine — gilt überall identisch
// (Engine Mix, Recent Mentions, künftige Drilldowns). Keine Status-Hues.
const SOURCES = [
  { name: "Perplexity", color: "var(--series-1)" },
  { name: "ChatGPT Search", color: "var(--series-2)" },
  { name: "Google AI Overview", color: "var(--series-3)" },
  { name: "Claude", color: "var(--series-4)" },
  { name: "Gemini", color: "var(--series-5)" },
  { name: "You.com", color: "var(--series-6)" },
] as const;

const ENGINE_COLOR: Record<string, string> = Object.fromEntries(
  SOURCES.map((s) => [s.name, s.color]),
);

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

function generate() {
  const r = seed("ai-vis-v1");
  const days = 30;
  const timeline = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const base = 12 + i * 0.6 + Math.sin(i / 4) * 4;
    return {
      date: date.toISOString().slice(5, 10),
      mentions: Math.round(base + (r() - 0.3) * 6),
      sov: Number((18 + i * 0.4 + (r() - 0.5) * 5).toFixed(1)),
    };
  });
  const sourceMix = SOURCES.map((s) => ({
    ...s,
    value: Math.round(20 + r() * 100),
  }));
  const sentiment = Array.from({ length: 7 }, (_, i) => ({
    week: `W${i + 1}`,
    positive: Math.round(35 + r() * 30 + i * 2),
    neutral: Math.round(20 + r() * 15),
    negative: Math.round(5 + r() * 10),
  }));
  const topQueries = [
    "best seo tools 2026",
    "ahrefs alternative",
    "rank tracker for agencies",
    "ai content optimization",
    "what is topical authority",
    "how to track ai citations",
    "core web vitals tools",
  ].map((q) => ({
    q,
    citations: Math.round(2 + r() * 24),
    sources: Math.ceil(r() * 5),
    sentiment: r() > 0.7 ? "positive" : r() > 0.3 ? "neutral" : "negative",
  }));
  return { timeline, sourceMix, sentiment, topQueries };
}

function Page() {
  const domain = "verity.app";
  const d = useMemo(() => generate(), []);
  const mentions = useMemo(() => getAiMentions(domain, 8), []);
  // Konsistenz-Fix: KPI „Erwähnungen" stammt aus derselben Quelle wie Engine Mix.
  const totalMentions = d.sourceMix.reduce((s, x) => s + x.value, 0);
  const lastSov = d.timeline[d.timeline.length - 1]!.sov;

  // Sentiment-KPI aus der letzten Sentiment-Woche ableiten — damit KPI und
  // Chart dieselbe Klassifikation/Zeitfenster nutzen.
  const lastSent = d.sentiment[d.sentiment.length - 1]!;
  const sentSum = lastSent.positive + lastSent.neutral + lastSent.negative;
  const positivePct = Math.round((lastSent.positive / sentSum) * 100);

  const [tab, setTab] = useState<"overview" | "queries" | "engines" | "mentions">("overview");
  const [search, setSearch] = useState("");
  const filteredMentions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mentions.filter((m) => !q || m.query.toLowerCase().includes(q) || m.snippet.toLowerCase().includes(q) || m.source.toLowerCase().includes(q));
  }, [mentions, search]);

  return (
    <AppShell title="AI Visibility" subtitle={`Wie KI-Engines ${domain} zitieren · letzte 30 Tage`}>
      <div className="flex flex-col gap-6">
        <PageTabs
          value={tab}
          onChange={(id) => setTab(id as typeof tab)}
          tabs={[
            { id: "overview", label: "Übersicht", to: "" },
            { id: "queries", label: "Queries", to: "" },
            { id: "engines", label: "Engines", to: "" },
            { id: "mentions", label: "Erwähnungen", to: "" },
          ]}
        />
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Erwähnungen" value={formatNumber(totalMentions)} delta={{ value: 24.6 }} accent="ai" />
          <MetricCard label="AI Share of Voice" value={`${lastSov}%`} metricKey="shareOfVoice" delta={{ value: 5.2 }} accent="ai" />
          <MetricCard label="Überwachte Engines" value="6" />
          <MetricCard label="Sentiment positiv" value={`${positivePct}%`} delta={{ value: 3.1 }} />
        </section>

        {(tab === "overview" || tab === "engines") && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel
            className="xl:col-span-2"
            title="Erwähnungen im Zeitverlauf"
            subtitle="Tägliche Zitate über alle Engines"
            badge="AEO"
            action={
              <ul className="flex items-center gap-3 text-[10px] font-mono text-ink-subtle">
                <li className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-5 h-0.5" style={{ background: "var(--ai-accent)" }} />
                  Zitate (links)
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-5" style={{ borderTop: "2px dashed var(--series-2)" }} />
                  AI SoV % (rechts)
                </li>
              </ul>
            }
          >
            <div className="h-64 -mx-2">
              <ResponsiveContainer>
                <LineChart data={d.timeline}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="m" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={36} label={{ value: "Zitate", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--ink-subtle)" }} />
                  <YAxis yAxisId="s" orientation="right" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} label={{ value: "SoV %", angle: 90, position: "insideRight", fontSize: 10, fill: "var(--ink-subtle)" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line yAxisId="m" name="Zitate" type="monotone" dataKey="mentions" stroke="var(--ai-accent)" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line yAxisId="s" name="AI SoV %" type="monotone" dataKey="sov" stroke="var(--series-2)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Engine-Verteilung" subtitle="Welche KI-Quellen dich zitieren">
            <ul className="flex flex-col gap-2.5">
              {d.sourceMix.sort((a, b) => b.value - a.value).map((s) => {
                const max = Math.max(...d.sourceMix.map((x) => x.value));
                const pct = (s.value / max) * 100;
                return (
                  <li key={s.name} className="flex items-center gap-3 text-sm">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 text-ink-muted truncate">{s.name}</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                    <span className="font-mono tabular-nums text-xs w-10 text-right">{s.value}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
        )}

        {(tab === "overview" || tab === "queries") && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel className="xl:col-span-2" title="Sentiment im Zeitverlauf" subtitle="Wöchentliche Klassifikation der Zitate">
            <div className="h-56 -mx-2">
              <ResponsiveContainer>
                <BarChart data={d.sentiment} stackOffset="expand">
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="positive" name="positiv" stackId="s" fill="var(--status-success)" />
                  <Bar dataKey="neutral" name="neutral" stackId="s" fill="var(--status-neutral)" />
                  <Bar dataKey="negative" name="negativ" stackId="s" fill="var(--status-error)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Top zitierte Queries"
            subtitle="Wo dich AI am häufigsten nennt"
            action={
              <button
                type="button"
                title="Queries vorschlagen, für die du zitiert werden könntest"
                aria-label="Queries vorschlagen, für die du zitiert werden könntest"
                className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider rounded-full px-2 py-1 border border-border hover:bg-muted transition-colors"
              >
                <Sparkles className="size-3.5" style={{ color: "var(--ai-accent)" }} />
                Vorschlagen
              </button>
            }
          >
            <div className="flex items-center gap-3 px-1 pb-2 text-[10px] font-mono uppercase tracking-wider text-ink-subtle border-b border-border/60 mb-1">
              <span className="flex-1">Query</span>
              <span className="w-10 text-right" title="Sentiment der Zitate">Stimmung</span>
              <span className="w-10 text-right" title="Anzahl Zitate">Zitate</span>
            </div>
            <ul className="flex flex-col">
              {d.topQueries.map((q, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.q}</p>
                    <p className="text-[11px] text-ink-subtle">{q.sources} Engines</p>
                  </div>
                  <SentBadge tone={q.sentiment as any} />
                  <span className="font-mono tabular-nums text-sm w-10 text-right">{q.citations}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        )}

        {(tab === "overview" || tab === "mentions") && (
        <Panel title="Letzte Erwähnungen" subtitle="Live-Feed der KI-Zitate">
          <FilterBar search={search} onSearch={setSearch} placeholder="Query, Snippet oder Engine durchsuchen…" />
          {filteredMentions.length === 0 ? (
            <EmptyState title="Keine Erwähnungen" description="Passe Suche oder Filter an." />
          ) : (
          <ul className="flex flex-col divide-y divide-border/60 mt-3">
            {filteredMentions.map((m, i) => (
              <li key={i} className="py-3 grid grid-cols-[auto_1fr_auto] gap-3 items-start">
                <span
                  className="text-[10px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 self-center whitespace-nowrap"
                  style={{
                    background: `color-mix(in oklab, ${ENGINE_COLOR[m.source] ?? "var(--series-1)"} 14%, transparent)`,
                    color: ENGINE_COLOR[m.source] ?? "var(--series-1)",
                  }}
                >
                  {m.source}
                </span>
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="text-ink-subtle">Query: </span>
                    <span className="font-medium">{m.query}</span>
                  </p>
                  <p className="text-[13px] text-ink-muted leading-snug mt-1">"{m.snippet}"</p>
                </div>
                <div className="flex items-center gap-2 self-center">
                  <SentBadge tone={m.sentiment} />
                  <span className="text-[11px] text-mono text-ink-subtle">vor {m.hoursAgo} h</span>
                </div>
              </li>
            ))}
          </ul>
          )}
        </Panel>
        )}

        {(tab === "overview" || tab === "engines" || tab === "queries") && (
          <CitationGap />
        )}
      </div>
    </AppShell>
  );
}

function SentBadge({ tone }: { tone: "positive" | "neutral" | "negative" }) {
  const map = {
    positive: { c: "var(--status-success)", Icon: TrendingUp, label: "positiv" },
    neutral: { c: "var(--status-neutral)", Icon: Minus, label: "neutral" },
    negative: { c: "var(--status-error)", Icon: TrendingDown, label: "negativ" },
  } as const;
  const v = map[tone];
  const Icon = v.Icon;
  return (
    <span
      className="size-5 grid place-items-center rounded"
      style={{ background: `color-mix(in oklab, ${v.c} 16%, transparent)`, color: v.c }}
      title={`Sentiment: ${v.label}`}
      aria-label={`Sentiment ${v.label}`}
      role="img"
    >
      <Icon className="size-3" aria-hidden />
    </span>
  );
}
