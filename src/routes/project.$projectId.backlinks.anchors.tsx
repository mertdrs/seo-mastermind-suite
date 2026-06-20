import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Panel, Td, Th, ChartTooltip } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { FilterBar, EmptyState } from "@/components/app/V2Shared";
import { getAnchors, type AnchorRow } from "@/lib/mock/backlinks-extra";
import { seriesColor } from "@/lib/tokens";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/backlinks/anchors")({
  head: () => ({ meta: [{ title: "Anchor-Texte — Verity" }] }),
  component: Page,
});

const TYPE_LABEL: Record<AnchorRow["type"], string> = {
  branded: "Branded",
  exact: "Exact Match",
  partial: "Partial Match",
  naked: "Naked URL",
  generic: "Generic",
  image: "Image",
};

function Page() {
  const rows = useMemo(() => getAnchors("verity.app"), []);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<AnchorRow["type"] | "all">("all");

  const byType = useMemo(() => {
    const map = new Map<AnchorRow["type"], number>();
    rows.forEach((r) => map.set(r.type, (map.get(r.type) ?? 0) + r.count));
    return [...map.entries()].map(([t, count]) => ({ name: TYPE_LABEL[t], type: t, count }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => (type === "all" || r.type === type) && (!q || r.anchor.toLowerCase().includes(q)));
  }, [rows, search, type]);

  const brandedShare = Math.round((byType.find((b) => b.type === "branded")?.count ?? 0) / rows.reduce((s, r) => s + r.count, 0) * 100);
  const exactShare = Math.round((byType.find((b) => b.type === "exact")?.count ?? 0) / rows.reduce((s, r) => s + r.count, 0) * 100);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Eindeutige Anchors" value={String(rows.length)} />
        <MetricCard label="Branded-Anteil" value={`${brandedShare}%`} delta={{ value: 1.2 }} />
        <MetricCard label="Exact-Match-Anteil" value={`${exactShare}%`} metricKey="affectedUrls" delta={{ value: -0.8 }} />
        <MetricCard label="Ø Dofollow je Anchor" value={`${Math.round(rows.reduce((s, r) => s + r.dofollowPct, 0) / rows.length)}%`} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Panel title="Verteilung nach Anchor-Typ" subtitle="Branded sollte dominieren">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byType} dataKey="count" innerRadius={48} outerRadius={86} paddingAngle={2} stroke="none">
                  {byType.map((_, i) => (<Cell key={i} fill={seriesColor(i)} />))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs mt-2">
            {byType.map((b, i) => (
              <li key={b.type} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: seriesColor(i) }} />
                <span className="flex-1 text-ink-muted">{b.name}</span>
                <span className="font-mono tabular-nums">{formatNumber(b.count)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="xl:col-span-2" title="Anchor-Liste" subtitle="Sortiert nach Häufigkeit">
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Anchor durchsuchen…"
            chips={type !== "all" ? [{ id: "t", label: `Typ: ${TYPE_LABEL[type]}`, onRemove: () => setType("all") }] : undefined}
          >
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" aria-label="Anchor-Typ filtern">
              <option value="all">Alle Typen</option>
              {Object.entries(TYPE_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </FilterBar>
          {filtered.length === 0 ? (
            <EmptyState title="Keine Anchors im Filter" />
          ) : (
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="border-b border-border">
                  <Th>Anchor</Th>
                  <Th>Typ</Th>
                  <Th align="right">Vorkommen</Th>
                  <Th align="right">Anteil</Th>
                  <Th align="right">Dofollow</Th>
                  <Th>Top Quelle</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.anchor} className="border-b border-border/60 hover:bg-muted/40">
                    <Td className="italic max-w-[220px] truncate">"{r.anchor}"</Td>
                    <Td className="text-ink-muted text-xs">{TYPE_LABEL[r.type]}</Td>
                    <Td align="right" className="font-mono tabular-nums">{formatNumber(r.count)}</Td>
                    <Td align="right" className="font-mono tabular-nums">{r.pct}%</Td>
                    <Td align="right" className="font-mono tabular-nums">{r.dofollowPct}%</Td>
                    <Td className="font-mono text-xs text-ink-subtle">{r.topReferring}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </>
  );
}
