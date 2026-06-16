import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
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
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, Panel, Pill, Td, Th } from "@/components/app/Atoms";
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

const SOURCES = [
  { name: "Perplexity", color: "var(--signal)" },
  { name: "ChatGPT Search", color: "var(--violet)" },
  { name: "Google AI Overview", color: "var(--chart-5)" },
  { name: "Claude", color: "var(--amber)" },
  { name: "Gemini", color: "var(--rose)" },
  { name: "You.com", color: "var(--ink-subtle)" },
] as const;

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
  const totalMentions = d.timeline.reduce((s, x) => s + x.mentions, 0);
  const lastSov = d.timeline[d.timeline.length - 1]!.sov;

  return (
    <AppShell title="AI Visibility" subtitle={`How AI engines cite ${domain} · last 30 days`}>
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Mentions" value={formatNumber(totalMentions)} delta={+24.6} />
          <Kpi label="AI Share of Voice" value={`${lastSov}%`} delta={+5.2} highlight />
          <Kpi label="Engines Tracked" value="6" hint="LLMs monitored" />
          <Kpi label="Sentiment" value="84%" hint="positive" delta={+3.1} />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel className="xl:col-span-2" title="Mentions Over Time" subtitle="Daily citations across all engines" badge="AEO">
            <div className="h-64 -mx-2">
              <ResponsiveContainer>
                <LineChart data={d.timeline}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="m" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} />
                  <YAxis yAxisId="s" orientation="right" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line yAxisId="m" type="monotone" dataKey="mentions" stroke="var(--signal)" strokeWidth={2.5} dot={false} />
                  <Line yAxisId="s" type="monotone" dataKey="sov" stroke="var(--violet)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Engine Mix" subtitle="Which AI sources cite you">
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel className="xl:col-span-2" title="Sentiment Over Time" subtitle="Weekly classification of citations">
            <div className="h-56 -mx-2">
              <ResponsiveContainer>
                <BarChart data={d.sentiment} stackOffset="expand">
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="positive" stackId="s" fill="var(--signal)" />
                  <Bar dataKey="neutral" stackId="s" fill="var(--ink-subtle)" />
                  <Bar dataKey="negative" stackId="s" fill="var(--rose)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Top Cited Queries" subtitle="Where AI sends you most" action={<Pill><Sparkles className="size-3.5 text-[color:var(--violet)]" />Suggest</Pill>}>
            <ul className="flex flex-col">
              {d.topQueries.map((q, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.q}</p>
                    <p className="text-[11px] text-ink-subtle">{q.sources} engines</p>
                  </div>
                  <SentBadge tone={q.sentiment as any} />
                  <span className="font-mono tabular-nums text-sm w-10 text-right">{q.citations}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Recent Mentions" subtitle="Live feed of AI citations">
          <ul className="flex flex-col divide-y divide-border/60">
            {mentions.map((m, i) => (
              <li key={i} className="py-3 grid grid-cols-[auto_1fr_auto] gap-3 items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 self-center" style={{ background: "color-mix(in oklab, var(--violet) 14%, transparent)", color: "var(--violet)" }}>
                  {m.source}
                </span>
                <div className="min-w-0">
                  <p className="text-sm">
                    <span className="text-ink-subtle">query: </span>
                    <span className="font-medium">{m.query}</span>
                  </p>
                  <p className="text-[13px] text-ink-muted leading-snug mt-1">"{m.snippet}"</p>
                </div>
                <div className="flex items-center gap-2 self-center">
                  <SentBadge tone={m.sentiment} />
                  <span className="text-[11px] text-mono text-ink-subtle">{m.hoursAgo}h ago</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, delta, hint, highlight }: { label: string; value: string; delta?: number; hint?: string; highlight?: boolean }) {
  return (
    <div className={`glass ring-aurora rounded-2xl p-4 ${highlight ? "ring-1 ring-[color:var(--aurora-cyan)]/30" : ""}`}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-display text-2xl font-semibold tabular-nums">{value}</span>
        {delta !== undefined && (
          <span className="text-[11px] font-mono" style={{ color: delta > 0 ? "var(--signal)" : "var(--rose)" }}>
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-ink-subtle mt-0.5">{hint}</p>}
    </div>
  );
}

function SentBadge({ tone }: { tone: "positive" | "neutral" | "negative" }) {
  const map = {
    positive: { c: "var(--signal)", label: "+" },
    neutral: { c: "var(--ink-subtle)", label: "○" },
    negative: { c: "var(--rose)", label: "−" },
  };
  const v = map[tone];
  return (
    <span
      className="size-5 grid place-items-center rounded text-[11px] font-mono font-semibold"
      style={{ background: `color-mix(in oklab, ${v.c} 16%, transparent)`, color: v.c }}
      title={tone}
    >
      {v.label}
    </span>
  );
}
