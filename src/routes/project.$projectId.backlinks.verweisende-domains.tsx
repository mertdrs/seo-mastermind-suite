import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Panel, IconButton, Td, Th } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { FilterBar, Paginator, EmptyState } from "@/components/app/V2Shared";
import { getReferringDomainsList, type RefDomainRow } from "@/lib/mock/backlinks-extra";
import { formatNumber } from "@/lib/format";
import { scoreColor } from "@/lib/tokens";

export const Route = createFileRoute("/project/$projectId/backlinks/verweisende-domains")({
  head: () => ({ meta: [{ title: "Verweisende Domains — Verity" }] }),
  component: Page,
});

function Page() {
  const rows = useMemo(() => getReferringDomainsList("verity.app", 80), []);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<RefDomainRow["category"] | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => (cat === "all" || r.category === cat) && (!q || r.domain.includes(q)));
  }, [rows, search, cat]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const avgDr = Math.round(rows.reduce((s, r) => s + r.dr, 0) / rows.length);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard label="Verweisende Domains" value={formatNumber(rows.length)} metricKey="referringDomains" delta={{ value: 2.1 }} />
        <MetricCard label="Ø DR" value={String(avgDr)} metricKey="domainRating" delta={{ value: 1.4 }} />
        <MetricCard label="Davon Top-Tier (DR ≥ 70)" value={String(rows.filter((r) => r.dr >= 70).length)} />
      </section>

      <Panel title="Liste verweisender Domains" subtitle="Aggregiert auf Domain-Ebene, sortiert nach DR">
        <FilterBar
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          placeholder="Domain suchen…"
          chips={cat !== "all" ? [{ id: "c", label: `Kategorie: ${cat}`, onRemove: () => setCat("all") }] : undefined}
        >
          <select value={cat} onChange={(e) => { setCat(e.target.value as typeof cat); setPage(1); }} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" aria-label="Kategorie filtern">
            <option value="all">Alle Kategorien</option>
            {["Tech", "News", "Marketing", "Community", "Other"].map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </FilterBar>
        {paged.length === 0 ? (
          <EmptyState title="Keine Domains im Filter" />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Domain</Th>
                <Th align="right">DR</Th>
                <Th align="right">Links</Th>
                <Th align="right">Dofollow</Th>
                <Th>Top Anchor</Th>
                <Th>Kategorie</Th>
                <Th align="right">Erstmals</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-medium">{r.domain}</Td>
                  <Td align="right">
                    <span className="font-mono tabular-nums text-xs rounded-md px-1.5 py-0.5"
                      style={{ background: `color-mix(in oklab, ${scoreColor(r.dr)} 14%, transparent)`, color: scoreColor(r.dr) }}>
                      {r.dr}
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">{r.links}</Td>
                  <Td align="right" className="font-mono tabular-nums">{r.dofollow}</Td>
                  <Td className="text-ink-muted italic max-w-[160px] truncate">"{r.topAnchor}"</Td>
                  <Td className="text-xs text-ink-muted">{r.category}</Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.firstSeen}</Td>
                  <Td align="right"><IconButton title="Domain öffnen"><ExternalLink className="size-3.5" /></IconButton></Td>
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
