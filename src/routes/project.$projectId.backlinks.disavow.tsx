import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Panel, IconButton, Td, Th, Pill } from "@/components/app/Atoms";
import { MetricCard, StatusBadge } from "@/components/app/V2";
import { FilterBar, EmptyState } from "@/components/app/V2Shared";
import { getDisavow, type DisavowRow } from "@/lib/mock/backlinks-extra";

export const Route = createFileRoute("/project/$projectId/backlinks/disavow")({
  head: () => ({ meta: [{ title: "Disavow — Verity" }] }),
  component: Page,
});

const STATUS_TONE: Record<DisavowRow["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  pending: "warning",
  removed: "neutral",
};

const STATUS_LABEL: Record<DisavowRow["status"], string> = {
  active: "aktiv",
  pending: "wartet",
  removed: "entfernt",
};

function Page() {
  const rows = useMemo(() => getDisavow("verity.app", 18), []);
  const [search, setSearch] = useState("");
  const active = rows.filter((r) => r.status === "active");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => !q || r.domain.includes(q) || r.reason.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Domains auf Disavow" value={String(active.length)} />
        <MetricCard label="Wartend" value={String(rows.filter((r) => r.status === "pending").length)} />
        <MetricCard label="Ø Toxic-Score" value={`${Math.round(rows.reduce((s, r) => s + r.toxicity, 0) / rows.length)}/100`} metricKey="affectedUrls" />
        <MetricCard label="Letzter Upload zu Google" value="vor 12d" />
      </section>

      <Panel
        title="Disavow-Liste"
        subtitle="Domains und URLs, die aus deinem Linkprofil ignoriert werden sollen"
        action={
          <div className="flex items-center gap-2">
            <Pill><Plus className="size-3.5" />Eintrag hinzufügen</Pill>
            <Pill><Download className="size-3.5" />disavow.txt</Pill>
          </div>
        }
      >
        <FilterBar search={search} onSearch={setSearch} placeholder="Domain oder Grund…" />
        {filtered.length === 0 ? (
          <EmptyState title="Keine Einträge" description="Füge problematische Domains hinzu oder lade eine bestehende disavow.txt." />
        ) : (
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-border">
                <Th>Domain / URL</Th>
                <Th>Scope</Th>
                <Th>Grund</Th>
                <Th align="right">Toxic</Th>
                <Th>Status</Th>
                <Th align="right">Hinzugefügt</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-muted/40">
                  <Td>
                    <div className="font-medium">{r.domain}</div>
                    {r.url && <div className="text-[11px] text-ink-subtle font-mono truncate max-w-[260px]">{r.url}</div>}
                  </Td>
                  <Td className="text-xs text-ink-muted font-mono">{r.scope === "domain" ? "domain:" : "URL"}</Td>
                  <Td className="text-ink-muted">{r.reason}</Td>
                  <Td align="right" className="font-mono tabular-nums" style={{ color: "var(--status-error)" }}>{r.toxicity}</Td>
                  <Td><StatusBadge severity={STATUS_TONE[r.status]} label={STATUS_LABEL[r.status]} size="sm" /></Td>
                  <Td align="right" className="text-ink-subtle text-xs font-mono">{r.addedAt}</Td>
                  <Td align="right"><IconButton title="Entfernen"><Trash2 className="size-3.5" /></IconButton></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="text-[11px] text-ink-subtle mt-4">
          Format folgt der Google-Spezifikation: <span className="font-mono">domain:beispiel.tld</span> pro Zeile, oder vollständige URL.
        </p>
      </Panel>
    </>
  );
}
