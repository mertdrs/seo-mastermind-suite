import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, IconButton, Panel, Pill, Td, Th } from "@/components/app/Atoms";
import { getBacklinks, getReferringDomainsGrowth } from "@/lib/mock/seo";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/backlinks")({
  head: () => ({
    meta: [
      { title: "Backlinks — Verity" },
      { name: "description", content: "Live backlink monitoring: new, lost, anchors and toxic risk in one place." },
    ],
  }),
  component: Page,
});

function Page() {
  const domain = "verity.app";
  const rows = useMemo(() => getBacklinks(domain, 24), []);
  const growth = useMemo(() => getReferringDomainsGrowth(domain), []);

  const totalLinks = 18_420;
  const refDomains = growth[growth.length - 1]!.total;
  const dofollow = rows.filter((r) => r.type === "dofollow").length;
  const dofollowPct = Math.round((dofollow / rows.length) * 100);

  const newLost = growth.slice(-14).map((g) => ({
    date: g.date.slice(5),
    gained: g.gained,
    lost: -g.lost,
    net: g.gained - g.lost,
  }));

  const anchorMix = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.anchorText, (map.get(r.anchorText) ?? 0) + 1));
    return [...map.entries()]
      .map(([anchor, count]) => ({ anchor, pct: Math.round((count / rows.length) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 7);
  }, [rows]);

  const tldDist = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const tld = "." + (r.domain.split(".").pop() || "com");
      map.set(tld, (map.get(tld) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [rows]);

  return (
    <AppShell title="Backlinks" subtitle={`${domain} · ${formatNumber(refDomains)} referring domains · ${formatNumber(totalLinks)} live links`}>
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Referring Domains" value={formatNumber(refDomains)} delta={+2.1} />
          <Kpi label="Total Backlinks" value={formatNumber(totalLinks)} delta={+4.6} />
          <Kpi label="Dofollow" value={`${dofollowPct}%`} delta={+0.8} />
          <Kpi label="Toxic Risk" value="2.1%" delta={-0.4} inverse />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel className="xl:col-span-2" title="Referring Domains" subtitle="Total over time">
            <div className="h-60 -mx-2">
              <ResponsiveContainer>
                <ComposedChart data={growth}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="total" stroke="var(--signal)" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="New vs Lost" subtitle="Last 14 days">
            <div className="h-60 -mx-2">
              <ResponsiveContainer>
                <BarChart data={newLost} stackOffset="sign">
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="gained" stackId="a" fill="var(--signal)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lost" stackId="a" fill="var(--rose)" radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel title="Anchor Distribution" subtitle="Most common anchor texts">
            <ul className="flex flex-col gap-2.5">
              {anchorMix.map((a) => (
                <li key={a.anchor} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate text-ink-muted">"{a.anchor}"</span>
                  <span className="font-mono tabular-nums text-xs w-10 text-right">{a.pct}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, a.pct * 3)}%`, background: "var(--violet)" }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="TLD Distribution" subtitle="Where your links come from">
            <div className="h-40 -mx-2">
              <ResponsiveContainer>
                <BarChart data={tldDist}>
                  <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--chart-5)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Link Type Mix">
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: "Dofollow", pct: dofollowPct, color: "var(--signal)" },
                { label: "Nofollow", pct: 24, color: "var(--violet)" },
                { label: "UGC", pct: 8, color: "var(--amber)" },
                { label: "Sponsored", pct: 4, color: "var(--rose)" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-3">
                  <span className="size-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-ink-muted w-24">{t.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                  <span className="font-mono tabular-nums text-xs w-10 text-right">{t.pct}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Live Backlinks" subtitle={`${rows.length} most recent links`} action={<Pill>Export CSV</Pill>}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Source domain</Th>
                <Th align="right">DR</Th>
                <Th align="right">Traffic</Th>
                <Th>Anchor</Th>
                <Th>Type</Th>
                <Th align="right">Toxic</Th>
                <Th align="right">First seen</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">{r.domain}</Td>
                  <Td align="right" className="font-mono tabular-nums">{r.dr}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(r.traffic)}</Td>
                  <Td className="text-ink-muted italic">"{r.anchorText}"</Td>
                  <Td><LinkType type={r.type} /></Td>
                  <Td align="right">
                    <ToxicCell value={r.toxicScore} />
                  </Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.firstSeen}</Td>
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
          {delta}%
        </span>
      </div>
    </div>
  );
}

function LinkType({ type }: { type: "dofollow" | "nofollow" | "ugc" }) {
  const map = {
    dofollow: "var(--signal)",
    nofollow: "var(--violet)",
    ugc: "var(--amber)",
  };
  return (
    <span
      className="text-[10px] uppercase tracking-wider font-mono rounded px-1.5 py-0.5"
      style={{ background: `color-mix(in oklab, ${map[type]} 16%, transparent)`, color: map[type] }}
    >
      {type}
    </span>
  );
}

function ToxicCell({ value }: { value: number }) {
  const c = value < 5 ? "var(--signal)" : value < 10 ? "var(--amber)" : "var(--rose)";
  return (
    <span
      className="font-mono tabular-nums text-xs rounded-md px-2 py-0.5"
      style={{ background: `color-mix(in oklab, ${c} 12%, transparent)`, color: c }}
    >
      {value}
    </span>
  );
}
