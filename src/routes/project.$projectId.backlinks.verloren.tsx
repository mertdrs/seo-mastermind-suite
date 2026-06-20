import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, ArrowDownRight, RotateCcw } from "lucide-react";
import { Panel, IconButton, Td, Th } from "@/components/app/Atoms";
import { MetricCard, StatusBadge } from "@/components/app/V2";
import { FilterBar, Paginator, EmptyState } from "@/components/app/V2Shared";
import { getLostLinks, type LostLinkRow } from "@/lib/mock/backlinks-extra";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/backlinks/verloren")({
  head: () => ({ meta: [{ title: "Verlorene Backlinks — Verity" }] }),
  component: Page,
});

const REASON_TONE: Record<LostLinkRow["reason"], "error" | "warning" | "info"> = {
  "404 auf Quelle": "error",
  "Link entfernt": "warning",
  "nofollow gesetzt": "info",
  "Quelle nicht erreichbar": "warning",
};

function Page() {
  const rows = useMemo(() => getLostLinks("verity.app", 48), []);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState<LostLinkRow["reason"] | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (reason === "all" || r.reason === reason) &&
      (!q || r.domain.includes(q) || r.anchorText.toLowerCase().includes(q))
    );
  }, [rows, search, reason]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Verlorene Links (30T)" value={formatNumber(rows.length)} metricKey="backlinks" delta={{ value: -6.2 }} />
        <MetricCard label="404 auf Quelle" value={String(rows.filter((r) => r.reason === "404 auf Quelle").length)} />
        <MetricCard label="Wiederherstellbar" value="62%" delta={{ value: 4.1 }} />
      </section>

      <Panel title="Verlorene Backlinks" subtitle="In den letzten 30 Tagen entdeckt">
        <FilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Domain oder Anchor…"
          chips={reason !== "all" ? [{ id: "r", label: `Grund: ${reason}`, onRemove: () => setReason("all") }] : undefined}
        >
          <select
            value={reason}
            onChange={(e) => { setReason(e.target.value as typeof reason); setPage(1); }}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
            aria-label="Grund filtern"
          >
            <option value="all">Alle Gründe</option>
            <option value="404 auf Quelle">404 auf Quelle</option>
            <option value="Link entfernt">Link entfernt</option>
            <option value="nofollow gesetzt">nofollow gesetzt</option>
            <option value="Quelle nicht erreichbar">Quelle nicht erreichbar</option>
          </select>
        </FilterBar>

        {paged.length === 0 ? (
          <EmptyState title="Keine verlorenen Links" description="Glückwunsch — nichts in diesem Filter." />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Quell-Domain</Th>
                <Th>Anchor</Th>
                <Th>Grund</Th>
                <Th align="right">DR</Th>
                <Th align="right">Verloren</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <ArrowDownRight className="size-3.5" style={{ color: "var(--status-error)" }} aria-label="verloren" />
                      {r.domain}
                    </span>
                  </Td>
                  <Td className="text-ink-muted italic max-w-[180px] truncate">"{r.anchorText}"</Td>
                  <Td><StatusBadge severity={REASON_TONE[r.reason]} label={r.reason} size="sm" /></Td>
                  <Td align="right" className="font-mono tabular-nums">{r.dr}</Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.lostAt}</Td>
                  <Td align="right">
                    <div className="inline-flex items-center gap-1">
                      <IconButton title="Quelle öffnen"><ExternalLink className="size-3.5" /></IconButton>
                      <IconButton title="Outreach-Vorlage öffnen"><RotateCcw className="size-3.5" /></IconButton>
                    </div>
                  </Td>
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
