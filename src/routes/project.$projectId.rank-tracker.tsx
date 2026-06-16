import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Bell, Plus, Smartphone, Monitor } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, Chip, Panel, Pill, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/rank-tracker")({
  head: () => ({
    meta: [
      { title: "Rank Tracker — Verity" },
      { name: "description", content: "Daily position tracking for the keywords that move your business." },
    ],
  }),
  component: Page,
});

const KEYWORDS = [
  "best project management software", "seo audit checklist", "ai writing tools",
  "content marketing strategy", "shopify vs woocommerce", "schema markup generator",
  "core web vitals optimization", "react server components", "saas pricing models",
  "backlink building strategies", "headless cms comparison", "vector database benchmark",
  "keyword research tutorial", "google search console guide", "technical seo guide",
];
const TAGS = ["brand", "money", "blog", "compare"];

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
  const r = seed("rank-tracker-v1");
  const rows = KEYWORDS.map((kw) => {
    const current = Math.round(1 + r() * 40);
    const previous = Math.max(1, current + Math.round((r() - 0.5) * 12));
    return {
      kw,
      current,
      previous,
      change: previous - current,
      volume: Math.round(200 + r() * 32_000),
      url: "/" + kw.split(" ").slice(0, 3).join("-"),
      tag: TAGS[Math.floor(r() * TAGS.length)]!,
      device: r() > 0.6 ? "mobile" : "desktop",
      best: Math.max(1, Math.min(current, previous) - Math.round(r() * 5)),
    };
  });
  const visibility = Array.from({ length: 30 }, (_, i) => {
    const base = 28 + Math.sin(i / 4) * 4 + i * 0.4;
    return {
      day: `${i + 1}`,
      visibility: Number((base + (r() - 0.5) * 2.5).toFixed(2)),
    };
  });
  const distribution = [
    { range: "1-3", value: rows.filter((r) => r.current <= 3).length, color: "var(--signal)" },
    { range: "4-10", value: rows.filter((r) => r.current > 3 && r.current <= 10).length, color: "var(--violet)" },
    { range: "11-20", value: rows.filter((r) => r.current > 10 && r.current <= 20).length, color: "var(--chart-5)" },
    { range: "21-50", value: rows.filter((r) => r.current > 20 && r.current <= 50).length, color: "var(--amber)" },
    { range: "50+", value: rows.filter((r) => r.current > 50).length, color: "var(--rose)" },
  ];
  return { rows, visibility, distribution };
}

function Page() {
  const [device, setDevice] = useState<"all" | "desktop" | "mobile">("all");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const d = useMemo(() => generate(), []);
  const filteredRows = d.rows.filter((r) => device === "all" || r.device === device);

  const top3 = filteredRows.filter((r) => r.current <= 3).length;
  const movers = filteredRows.filter((r) => Math.abs(r.change) >= 4);
  const avg = (filteredRows.reduce((s, r) => s + r.current, 0) / Math.max(1, filteredRows.length)).toFixed(1);

  return (
    <AppShell title="Rank Tracker" subtitle={`${filteredRows.length} tracked keywords · daily refresh · last ${period}`}>
      <div className="flex flex-col gap-6">
        <section className="glass ring-aurora rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SegmentedControl
              value={device}
              onChange={setDevice}
              options={[
                { id: "all", label: "All" },
                { id: "desktop", label: "Desktop" },
                { id: "mobile", label: "Mobile" },
              ]}
            />
            <SegmentedControl
              value={period}
              onChange={setPeriod}
              options={[
                { id: "7d", label: "7d" },
                { id: "30d", label: "30d" },
                { id: "90d", label: "90d" },
              ]}
            />
            <div className="h-6 w-px bg-border mx-1" />
            {TAGS.map((t) => (
              <Chip key={t}>#{t}</Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Pill>
              <Bell className="size-3.5" /> 3 alerts
            </Pill>
            <Pill>
              <Plus className="size-3.5" /> Add keywords
            </Pill>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Visibility" value={`${(filteredRows.length ? d.visibility[d.visibility.length - 1]!.visibility : 0).toFixed(1)}%`} delta={+3.2} />
          <Kpi label="Average Position" value={avg} delta={-1.4} inverse />
          <Kpi label="Top 3" value={String(top3)} delta={+2} />
          <Kpi label="Movers (≥4)" value={String(movers.length)} delta={+5} />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel className="xl:col-span-2" title="Visibility Index" subtitle="Share of estimated traffic across tracked keywords">
            <div className="h-64 -mx-2">
              <ResponsiveContainer>
                <AreaChart data={d.visibility}>
                  <defs>
                    <linearGradient id="vis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="var(--signal)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="visibility" stroke="var(--signal)" strokeWidth={2.5} fill="url(#vis)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Position Distribution" subtitle="Where your tracked terms rank today">
            <div className="h-44 -mx-2">
              <ResponsiveContainer>
                <BarChart data={d.distribution}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {d.distribution.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-mono">
              {d.distribution.map((b) => (
                <li key={b.range} className="text-center">
                  <span className="block tabular-nums font-semibold" style={{ color: b.color }}>{b.value}</span>
                  <span className="text-ink-subtle">{b.range}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Tracked Keywords" subtitle="Click any row for daily history">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Keyword</Th>
                <Th>Tag</Th>
                <Th>Device</Th>
                <Th>URL</Th>
                <Th align="right">Volume</Th>
                <Th align="right">Best</Th>
                <Th align="right">Previous</Th>
                <Th align="right">Current</Th>
                <Th align="right">Δ</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.kw} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">{r.kw}</Td>
                  <Td><span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted">#{r.tag}</span></Td>
                  <Td>
                    {r.device === "mobile" ? <Smartphone className="size-3.5 text-ink-muted" /> : <Monitor className="size-3.5 text-ink-muted" />}
                  </Td>
                  <Td className="text-ink-subtle text-xs font-mono">{r.url}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(r.volume)}</Td>
                  <Td align="right" className="font-mono tabular-nums text-ink-subtle">{r.best}</Td>
                  <Td align="right" className="font-mono tabular-nums text-ink-subtle">{r.previous}</Td>
                  <Td align="right">
                    <PositionPill pos={r.current} />
                  </Td>
                  <Td align="right"><Delta value={r.change} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, delta, inverse }: { label: string; value: string; delta: number; inverse?: boolean }) {
  const good = inverse ? delta < 0 : delta > 0;
  return (
    <div className="glass ring-aurora rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-display text-2xl font-semibold tabular-nums">{value}</span>
        <span className="text-[11px] font-mono" style={{ color: good ? "var(--signal)" : "var(--rose)" }}>
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      </div>
    </div>
  );
}

function PositionPill({ pos }: { pos: number }) {
  const c = pos <= 3 ? "var(--signal)" : pos <= 10 ? "var(--violet)" : pos <= 20 ? "var(--chart-5)" : "var(--ink-subtle)";
  return (
    <span className="text-mono text-xs font-semibold rounded-md px-2 py-0.5 tabular-nums" style={{ background: `color-mix(in oklab, ${c} 15%, transparent)`, color: c }}>
      {pos}
    </span>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-ink-subtle text-xs">—</span>;
  const up = value > 0;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-[11px] font-mono tabular-nums")}
      style={{ color: up ? "var(--signal)" : "var(--rose)" }}
    >
      {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(value)}
    </span>
  );
}
