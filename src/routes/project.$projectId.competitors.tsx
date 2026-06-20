import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend as RLegend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Plus, Swords, X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, KdBar, Panel, Pill, Td, Th } from "@/components/app/Atoms";
import { StatusBadge, TrackKeywordButton } from "@/components/app/V2";
import { competitorColor } from "@/lib/tokens";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/competitors")({
  head: () => ({
    meta: [
      { title: "Competitive Analysis — Verity" },
      { name: "description", content: "See where competitors win and where you have a path to overtake." },
    ],
  }),
  component: Page,
});

/** Wettbewerber-Farbzuordnung — wird domain-spezifisch aufgelöst. */
function colorFor(domain: string, idx: number) {
  return competitorColor(domain, Math.max(0, idx - 1));
}

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

function compMetrics(d: string) {
  const r = seed(d);
  return {
    domain: d,
    dr: Math.round(35 + r() * 60),
    traffic: Math.round(40_000 + r() * 1_800_000),
    keywords: Math.round(2_000 + r() * 120_000),
    backlinks: Math.round(8_000 + r() * 900_000),
    sov: Number((r() * 30 + 4).toFixed(1)),
    overlap: Math.round(20 + r() * 60),
    breakdown: {
      tech: Math.round(50 + r() * 45),
      content: Math.round(40 + r() * 55),
      authority: Math.round(45 + r() * 50),
      ux: Math.round(50 + r() * 45),
      aeo: Math.round(30 + r() * 60),
    },
  };
}

function Page() {
  const [you] = useState("verity.app");
  const [comps, setComps] = useState(["ahrefs.com", "semrush.com", "moz.com"]);
  const [draft, setDraft] = useState("");
  const all = useMemo(() => [you, ...comps].map(compMetrics), [you, comps]);

  const sov30 = useMemo(() => {
    const r = seed(you + comps.join(","));
    return Array.from({ length: 30 }, (_, i) => {
      const row: Record<string, number | string> = { day: `${i + 1}` };
      [you, ...comps].forEach((d, idx) => {
        const base = compMetrics(d).sov;
        row[d] = Math.max(0.5, base + (r() - 0.5) * 4 + idx * 0.1);
      });
      return row;
    });
  }, [you, comps]);

  const gap = useMemo(() => {
    const r = seed("gap-" + comps.join(","));
    return Array.from({ length: 12 }, (_, i) => ({
      keyword: ["seo tools 2026","best content marketing","keyword research saas","ai overview optimization",
        "backlink monitor","serp tracker free","topic clusters guide","content brief template",
        "schema markup generator","technical seo audit","saas link building","ahrefs alternative"][i]!,
      you: Math.round(r() * 50) > 35 ? Math.round(40 + r() * 60) : 0,
      [comps[0]!]: Math.round(1 + r() * 30),
      [comps[1]!]: Math.round(3 + r() * 40),
      [comps[2]!]: Math.round(2 + r() * 50),
      volume: Math.round(400 + r() * 22_000),
      kd: Math.round(15 + r() * 70),
    }));
  }, [comps]);

  const radar = useMemo(() => {
    const axes = ["Tech", "Content", "Authority", "UX", "AEO"] as const;
    const keys = ["tech", "content", "authority", "ux", "aeo"] as const;
    return axes.map((axis, i) => {
      const row: Record<string, number | string> = { axis };
      all.forEach((c) => {
        row[c.domain] = c.breakdown[keys[i]!];
      });
      return row;
    });
  }, [all]);

  return (
    <AppShell title="Competitive Analysis" subtitle={`${you} vs ${comps.length} competitors · last 30 days`}>
      <div className="flex flex-col gap-6">
        {/* Competitor picker */}
        <section className="glass ring-aurora rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle mr-1">You</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)", borderColor: "var(--brand)" }}
            >
              {you}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle ml-3 mr-1">vs.</span>
            {comps.map((c, i) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-1 text-[11px] font-medium border border-border bg-surface-2"
                style={{ boxShadow: `inset 3px 0 0 ${colorFor(c, i + 1)}` }}
              >
                {c}
                <button onClick={() => setComps(comps.filter((x) => x !== c))} className="size-4 grid place-items-center rounded-full hover:bg-muted">
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft && comps.length < 4) {
                  setComps([...comps, draft]);
                  setDraft("");
                }
              }}
              className="inline-flex items-center"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="add competitor…"
                className="bg-transparent border border-dashed border-border rounded-full px-3 py-1 text-[11px] outline-none focus:border-foreground"
              />
              <button type="submit" className="ml-1 size-6 grid place-items-center rounded-full border border-border hover:bg-muted">
                <Plus className="size-3" />
              </button>
            </form>
          </div>
        </section>

        {/* Compare grid */}
        <section className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <Panel className="xl:col-span-3" title="Share of Voice" subtitle="Estimated % of clicks across tracked keywords">
            <div className="h-64 -mx-2">
              <ResponsiveContainer>
                <LineChart data={sov30}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<ChartTooltip />} />
                  {[you, ...comps].map((d, i) => (
                    <Line key={d} type="monotone" dataKey={d} stroke={colorFor(d, i)} strokeWidth={i === 0 ? 2.5 : 1.5} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-3 text-[11px] text-mono text-ink-subtle">
              {[you, ...comps].map((d, i) => (
                <span key={d} className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-4 h-0.5" style={{ background: colorFor(d, i) }} />
                  {d}
                </span>
              ))}
            </div>
          </Panel>

          <Panel className="xl:col-span-2" title="Strength Profile" subtitle="Five-axis comparison">
            <div className="h-72">
              <ResponsiveContainer>
                <RadarChart data={radar} outerRadius={92}>
                  <PolarGrid stroke="color-mix(in oklab, var(--ink) 10%, transparent)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} />
                  {[you, ...comps].map((d, i) => (
                    <Radar key={d} dataKey={d} stroke={colorFor(d, i)} fill={colorFor(d, i)} fillOpacity={i === 0 ? 0.25 : 0.08} strokeWidth={i === 0 ? 2 : 1.25} />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </section>

        {/* Metric matrix */}
        <Panel title="Side-by-Side Metrics">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Domain</Th>
                <Th align="right">DR</Th>
                <Th align="right">Traffic</Th>
                <Th align="right">Keywords</Th>
                <Th align="right">Backlinks</Th>
                <Th align="right">Share of Voice</Th>
                <Th align="right">Keyword Overlap</Th>
              </tr>
            </thead>
            <tbody>
              {all.map((c, i) => (
                <tr key={c.domain} className={cn("border-b border-border/60", i === 0 && "bg-muted/40")}>
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: colorFor(c.domain, i) }} />
                      <span className="font-medium">{c.domain}</span>
                      {i === 0 && <span className="text-[9px] text-mono uppercase tracking-widest text-ink-subtle">you</span>}
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">{c.dr}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(c.traffic)}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(c.keywords)}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(c.backlinks)}</Td>
                  <Td align="right" className="font-mono tabular-nums">{c.sov}%</Td>
                  <Td align="right">{i === 0 ? <span className="text-ink-subtle">—</span> : <KdBar value={c.overlap} />}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Gap keywords */}
        <Panel
          title="Keyword Gap"
          subtitle="Wo Wettbewerber ranken und du (noch) nicht — Position: niedriger = besser"
          action={<Pill>Export CSV</Pill>}
        >
          <div className="h-44 -mx-2 mb-4">
            <ResponsiveContainer>
              <BarChart data={gap.slice(0, 8)}>
                <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                <XAxis dataKey="keyword" tick={{ fontSize: 9, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--ink-subtle)" }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                  reversed
                  label={{ value: "Position (besser ↑)", angle: -90, position: "insideLeft", fontSize: 10, fill: "var(--ink-subtle)" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="you" fill={colorFor(you, 0)} radius={[4, 4, 0, 0]} />
                {comps.map((c, i) => (
                  <Bar key={c} dataKey={c} fill={colorFor(c, i + 1)} radius={[4, 4, 0, 0]} />
                ))}
                <RLegend wrapperStyle={{ fontSize: 10, color: "var(--ink-subtle)" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Keyword</Th>
                <Th align="right">Volume</Th>
                <Th align="right">KD</Th>
                <Th align="right">You</Th>
                {comps.map((c) => (
                  <Th key={c} align="right">{c.split(".")[0]}</Th>
                ))}
                <Th>Opportunity</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {gap.map((g) => {
                const compRanks = comps.map((c) => g[c] as number);
                const minComp = Math.min(...compRanks);
                const youRank = g.you as number;
                const opp: "Untapped" | "Behind" | "Competitive" =
                  !youRank ? "Untapped" : youRank > minComp + 5 ? "Behind" : "Competitive";
                const sev = opp === "Untapped" ? "success" : opp === "Behind" ? "warning" : "info";
                const label = opp === "Untapped" ? "Untapped" : opp === "Behind" ? "Behind" : "Competitive";
                return (
                  <tr key={g.keyword} className="border-b border-border/60 hover:bg-muted/40">
                    <Td className="font-medium">{g.keyword}</Td>
                    <Td align="right" className="font-mono tabular-nums">{formatNumber(g.volume)}</Td>
                    <Td align="right"><KdBar value={g.kd} /></Td>
                    <Td align="right" className="font-mono tabular-nums">{youRank || "—"}</Td>
                    {comps.map((c) => (
                      <Td key={c} align="right" className="font-mono tabular-nums text-ink-muted">{g[c] as number}</Td>
                    ))}
                    <Td>
                      <StatusBadge severity={sev} label={label} size="sm" withIcon={false} />
                    </Td>
                    <Td align="right">
                      <TrackKeywordButton keyword={g.keyword} source="competitiveGap" />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </AppShell>
  );
}
