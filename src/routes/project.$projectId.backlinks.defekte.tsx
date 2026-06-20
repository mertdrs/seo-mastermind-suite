import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Wrench } from "lucide-react";
import { Panel, IconButton, Td, Th } from "@/components/app/Atoms";
import { MetricCard, StatusBadge } from "@/components/app/V2";
import { FilterBar, Paginator, EmptyState } from "@/components/app/V2Shared";
import { getBrokenLinks } from "@/lib/mock/backlinks-extra";

export const Route = createFileRoute("/project/$projectId/backlinks/defekte")({
  head: () => ({ meta: [{ title: "Defekte Backlinks — Verity" }] }),
  component: Page,
});

function statusTone(s: 404 | 410 | 500 | 301) {
  if (s === 404 || s === 410) return "error" as const;
  if (s === 500) return "warning" as const;
  return "info" as const;
}

function Page() {
  const rows = useMemo(() => getBrokenLinks("verity.app", 36), []);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => !q || r.sourceUrl.includes(q) || r.targetUrl.includes(q));
  }, [rows, search]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const recoverable = rows.filter((r) => r.recoverable).length;
  const lostEquity = "≈ DR 38";

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Defekte eingehende Links" value={String(rows.length)} metricKey="affectedUrls" delta={{ value: 2.1 }} />
        <MetricCard label="Wiederherstellbar" value={`${recoverable}`} delta={{ value: 4.2 }} />
        <MetricCard label="Verlorene Link-Equity" value={lostEquity} metricKey="domainRating" delta={{ value: -1.4 }} />
      </section>

      <Panel
        title="Defekte Backlinks"
        subtitle="Externe Links zeigen auf nicht erreichbare Ziel-URLs deiner Domain"
        action={<span className="text-[11px] text-ink-subtle">Tipp: 404 → 301-Redirect setzen, um Equity zurückzuholen</span>}
      >
        <FilterBar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Quelle oder Ziel suchen…" />
        {paged.length === 0 ? (
          <EmptyState title="Keine defekten Links" description="Dein Profil ist sauber." />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Quell-URL</Th>
                <Th>Ziel-URL (404)</Th>
                <Th>Anchor</Th>
                <Th>Status</Th>
                <Th align="right">Geprüft</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-mono text-xs text-ink-muted max-w-[240px] truncate">{r.sourceUrl}</Td>
                  <Td className="font-mono text-xs max-w-[240px] truncate" style={{ color: "var(--status-error)" }}>{r.targetUrl}</Td>
                  <Td className="text-ink-muted italic max-w-[140px] truncate">"{r.anchorText}"</Td>
                  <Td><StatusBadge severity={statusTone(r.status)} label={String(r.status)} size="sm" /></Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.lastChecked}</Td>
                  <Td align="right">
                    <div className="inline-flex gap-1">
                      <IconButton title="Quelle öffnen"><ExternalLink className="size-3.5" /></IconButton>
                      <IconButton title="301-Redirect vorschlagen"><Wrench className="size-3.5" /></IconButton>
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
