import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { Panel, IconButton, Td, Th } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { FilterBar, Paginator, EmptyState } from "@/components/app/V2Shared";
import { getNewLinks } from "@/lib/mock/backlinks-extra";
import { formatNumber } from "@/lib/format";
import { LinkType } from "./project.$projectId.backlinks.index";

export const Route = createFileRoute("/project/$projectId/backlinks/neu")({
  head: () => ({ meta: [{ title: "Neue Backlinks — Verity" }] }),
  component: Page,
});

function Page() {
  const rows = useMemo(() => getNewLinks("verity.app", 64), []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => !q || r.domain.includes(q) || r.anchorText.toLowerCase().includes(q));
  }, [rows, search]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalNew = rows.length;
  const dofollow = rows.filter((r) => r.type === "dofollow").length;
  const avgDr = Math.round(rows.reduce((s, r) => s + r.dr, 0) / rows.length);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Neue Links (30T)" value={formatNumber(totalNew)} metricKey="backlinks" delta={{ value: 12.4 }} />
        <MetricCard label="Davon Dofollow" value={`${Math.round((dofollow / totalNew) * 100)}%`} delta={{ value: 3.1 }} />
        <MetricCard label="Ø DR der Quellen" value={String(avgDr)} metricKey="domainRating" delta={{ value: 1.8 }} />
      </section>

      <Panel title="Neu gewonnene Links" subtitle="In den letzten 30 Tagen entdeckt">
        <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Domain oder Anchor…" />
        {paged.length === 0 ? (
          <EmptyState title="Keine neuen Links im Filter" />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Quell-Domain</Th>
                <Th>Anchor</Th>
                <Th>Ziel-URL</Th>
                <Th align="right">DR</Th>
                <Th>Typ</Th>
                <Th align="right">Erstmals</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowUpRight className="size-3.5" style={{ color: "var(--status-success)" }} aria-label="neu" />
                      {r.domain}
                    </span>
                  </Td>
                  <Td className="text-ink-muted italic max-w-[200px] truncate">"{r.anchorText}"</Td>
                  <Td className="font-mono text-xs text-ink-subtle max-w-[200px] truncate">{r.targetUrl}</Td>
                  <Td align="right" className="font-mono tabular-nums">{r.dr}</Td>
                  <Td><LinkType type={r.type} /></Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.firstSeen}</Td>
                  <Td align="right"><IconButton title="Quelle öffnen"><ExternalLink className="size-3.5" /></IconButton></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Paginator page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />
      </Panel>
    </>
  );
}
