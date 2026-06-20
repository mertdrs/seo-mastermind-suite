import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ExternalLink, Info } from "lucide-react";
import { ChartTooltip, IconButton, Panel, Pill, Td, Th } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { FilterBar, Paginator, EmptyState } from "@/components/app/V2Shared";
import { getBacklinks, getReferringDomainsGrowth } from "@/lib/mock/seo";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/backlinks/")({
  head: () => ({ meta: [{ title: "Backlinks – Übersicht — Verity" }] }),
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

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => !q || r.domain.includes(q) || r.anchorText.toLowerCase().includes(q));
  }, [rows, search]);
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const linkAttributes = useMemo(() => {
    const total = rows.length;
    const nofollow = rows.filter((r) => r.type === "nofollow").length;
    const ugc = rows.filter((r) => r.type === "ugc").length;
    const sponsored = Math.round(ugc * 0.35);
    return [
      { label: "Dofollow", pct: Math.round((dofollow / total) * 100), color: "var(--series-1)" },
      { label: "Nofollow", pct: Math.round((nofollow / total) * 100), color: "var(--series-2)" },
      { label: "UGC", pct: Math.round((ugc / total) * 100), color: "var(--series-3)" },
      { label: "Sponsored", pct: Math.round((sponsored / total) * 100), color: "var(--series-4)" },
    ];
  }, [rows, dofollow]);

  const newLost = growth.slice(-14).map((g) => ({
    date: g.date.slice(5),
    gained: g.gained,
    lost: -g.lost,
  }));

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Verweisende Domains" value={formatNumber(refDomains)} metricKey="referringDomains" delta={{ value: 2.1 }} />
        <MetricCard label="Backlinks gesamt" value={formatNumber(totalLinks)} metricKey="backlinks" delta={{ value: 4.6 }} />
        <MetricCard label="Dofollow-Anteil" value={`${dofollowPct}%`} delta={{ value: 0.8 }} />
        <MetricCard label="Toxische Links" value="2,1%" metricKey="affectedUrls" delta={{ value: -0.4 }} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel className="xl:col-span-2" title="Verweisende Domains" subtitle="Verlauf">
          <div className="h-60 -mx-2">
            <ResponsiveContainer>
              <ComposedChart data={growth}>
                <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" stroke="var(--series-1)" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Neu vs. Verloren" subtitle="Letzte 14 Tage">
          <div className="h-60 -mx-2">
            <ResponsiveContainer>
              <BarChart data={newLost} stackOffset="sign">
                <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="gained" stackId="a" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" stackId="a" fill="var(--status-error)" radius={[0, 0, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Link-Attribute"
        subtitle="Anteil je Attribut am Gesamtprofil"
        action={
          <span className="inline-flex items-center gap-1 text-[10px] text-ink-subtle"
            title="Ein Link kann mehrere Attribute haben (z. B. nofollow + ugc). Die Anteile summieren sich daher nicht auf 100 %.">
            <Info className="size-3" /> kann sich überschneiden
          </span>
        }
      >
        <div className="flex flex-col gap-3 text-sm">
          {linkAttributes.map((t) => (
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

      <Panel
        title="Live-Backlinks"
        subtitle={`${filteredRows.length} Links${search ? ` (gefiltert von ${rows.length})` : ""}`}
        action={<div className="flex items-center gap-2"><ToxicLegend /><Pill>Export CSV</Pill></div>}
      >
        <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Domain oder Anchor suchen…" />
        {pagedRows.length === 0 ? (
          <EmptyState title="Keine Treffer" description="Passe Suche oder Filter an." />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Quell-Domain</Th>
                <Th align="right">DR</Th>
                <Th align="right">Traffic</Th>
                <Th>Anchor</Th>
                <Th>Typ</Th>
                <Th align="right">Toxizität</Th>
                <Th align="right">Erstmals</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">{r.domain}</Td>
                  <Td align="right" className="font-mono tabular-nums">{r.dr}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(r.traffic)}</Td>
                  <Td className="text-ink-muted italic">"{r.anchorText}"</Td>
                  <Td><LinkType type={r.type} /></Td>
                  <Td align="right"><ToxicCell value={Math.min(100, r.toxicScore * 6)} /></Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.firstSeen}</Td>
                  <Td align="right"><IconButton title="Open"><ExternalLink className="size-3.5" /></IconButton></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Paginator page={page} pageSize={pageSize} total={filteredRows.length} onPageChange={setPage} />
      </Panel>
    </>
  );
}

export function LinkType({ type }: { type: "dofollow" | "nofollow" | "ugc" }) {
  const map = { dofollow: "var(--series-1)", nofollow: "var(--series-2)", ugc: "var(--series-3)" };
  const label = { dofollow: "Dofollow", nofollow: "Nofollow", ugc: "UGC" }[type];
  return (
    <span className="text-[10px] uppercase tracking-wider font-mono rounded px-1.5 py-0.5"
      style={{ background: `color-mix(in oklab, ${map[type]} 16%, transparent)`, color: map[type] }}>
      {label}
    </span>
  );
}

export function ToxicCell({ value }: { value: number }) {
  const c = value <= 30 ? "var(--status-success)" : value <= 70 ? "var(--status-warning)" : "var(--status-error)";
  const label = value <= 30 ? "niedrig" : value <= 70 ? "mittel" : "hoch";
  return (
    <span className="font-mono tabular-nums text-xs rounded-md px-2 py-0.5"
      style={{ background: `color-mix(in oklab, ${c} 12%, transparent)`, color: c }}
      title={`Toxic-Score ${value}/100 (${label}).`}>
      {Math.round(value)}
    </span>
  );
}

function ToxicLegend() {
  return (
    <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-ink-subtle font-mono"
      title="Skala 0–100 pro Link: hoch = schlecht.">
      <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: "var(--status-success)" }} />0–30 niedrig</span>
      <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: "var(--status-warning)" }} />31–70 mittel</span>
      <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full" style={{ background: "var(--status-error)" }} />71–100 hoch</span>
    </span>
  );
}
