import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Filter, Search } from "lucide-react";
import { Panel, Td, Th } from "@/components/app/Atoms";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/site-audit/unterseiten")({
  component: Page,
});

type Status = "indexable" | "noindex" | "blocked" | "redirect";
type Row = {
  url: string;
  status: Status;
  code: number;
  depth: number;
  size: number; // KB
  ttfb: number; // ms
  words: number;
  issues: number;
};

const ROWS: Row[] = [
  { url: "/", status: "indexable", code: 200, depth: 0, size: 124, ttfb: 92, words: 842, issues: 1 },
  { url: "/leistungen", status: "indexable", code: 200, depth: 1, size: 98, ttfb: 110, words: 612, issues: 2 },
  { url: "/leistungen/seo", status: "indexable", code: 200, depth: 2, size: 142, ttfb: 124, words: 1240, issues: 0 },
  { url: "/leistungen/webdesign", status: "indexable", code: 200, depth: 2, size: 156, ttfb: 138, words: 988, issues: 1 },
  { url: "/ueber-uns", status: "indexable", code: 200, depth: 1, size: 78, ttfb: 88, words: 420, issues: 3 },
  { url: "/blog", status: "indexable", code: 200, depth: 1, size: 184, ttfb: 156, words: 320, issues: 1 },
  { url: "/blog/lead-gen-2025", status: "indexable", code: 200, depth: 2, size: 212, ttfb: 198, words: 2480, issues: 0 },
  { url: "/kontakt", status: "indexable", code: 200, depth: 1, size: 64, ttfb: 82, words: 180, issues: 4 },
  { url: "/impressum", status: "noindex", code: 200, depth: 2, size: 42, ttfb: 76, words: 280, issues: 0 },
  { url: "/datenschutz", status: "noindex", code: 200, depth: 2, size: 88, ttfb: 84, words: 1820, issues: 0 },
  { url: "/admin", status: "blocked", code: 200, depth: 1, size: 0, ttfb: 0, words: 0, issues: 0 },
  { url: "/old-pricing", status: "redirect", code: 301, depth: 1, size: 0, ttfb: 64, words: 0, issues: 0 },
  { url: "/karriere", status: "indexable", code: 200, depth: 1, size: 102, ttfb: 124, words: 540, issues: 1 },
  { url: "/karriere/seo-consultant", status: "indexable", code: 200, depth: 2, size: 88, ttfb: 132, words: 720, issues: 0 },
  { url: "/team", status: "indexable", code: 200, depth: 1, size: 96, ttfb: 102, words: 480, issues: 2 },
  { url: "/referenzen", status: "indexable", code: 200, depth: 1, size: 144, ttfb: 144, words: 360, issues: 0 },
  { url: "/agb", status: "noindex", code: 200, depth: 2, size: 68, ttfb: 78, words: 1240, issues: 0 },
  { url: "/sitemap.xml", status: "indexable", code: 200, depth: 0, size: 12, ttfb: 32, words: 0, issues: 0 },
];

const TABS: { id: "alle" | Status; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "indexable", label: "Indexierbar" },
  { id: "noindex", label: "Nicht indexierbar" },
  { id: "blocked", label: "Robots.txt blockiert" },
  { id: "redirect", label: "Weiterleitungen" },
];

function Page() {
  const [tab, setTab] = useState<"alle" | Status>("alle");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return ROWS.filter((r) => (tab === "alle" || r.status === tab) && (q ? r.url.toLowerCase().includes(q.toLowerCase()) : true));
  }, [tab, q]);

  const total = ROWS.length;
  const indexable = ROWS.filter((r) => r.status === "indexable").length;
  const analyzed = ROWS.filter((r) => r.code === 200 && r.status !== "blocked").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard label="Gecrawlte Seiten" value={total} />
        <KpiCard label="Gefundene Seiten" value={total} />
        <KpiCard label="Analysierte Seiten" value={analyzed} />
      </div>

      <Panel
        title="Unterseiten"
        subtitle={`${indexable} indexierbar von ${total}`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="URL finden…"
                className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface-2 w-48 outline-none focus:ring-2 focus:ring-[color:var(--signal)]/30"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs hover:bg-muted/70">
              <Filter className="size-3.5" /> Filter
            </button>
          </div>
        }
      >
        <nav className="flex items-center gap-1 border-b border-border mb-3 -mt-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-3 py-2 text-xs font-medium -mb-px border-b-2 transition-colors",
                  active
                    ? "border-[color:var(--signal)] text-foreground"
                    : "border-transparent text-ink-muted hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>URL</Th>
                <Th>Status</Th>
                <Th align="right">Code</Th>
                <Th align="right">Tiefe</Th>
                <Th align="right">Größe</Th>
                <Th align="right">TTFB</Th>
                <Th align="right">Wörter</Th>
                <Th align="right">Probleme</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.url} className="border-b border-border/60 hover:bg-muted/40">
                  <Td>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs truncate">{r.url}</span>
                      <ExternalLink className="size-3 text-ink-subtle shrink-0" />
                    </div>
                  </Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td align="right" className="font-mono tabular-nums text-xs">{r.code}</Td>
                  <Td align="right" className="font-mono tabular-nums">{r.depth}</Td>
                  <Td align="right" className="font-mono tabular-nums text-xs">{r.size > 0 ? `${r.size} KB` : "—"}</Td>
                  <Td align="right" className="font-mono tabular-nums text-xs">{r.ttfb > 0 ? `${r.ttfb} ms` : "—"}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(r.words)}</Td>
                  <Td align="right">
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono"
                      style={{
                        background: r.issues === 0
                          ? "color-mix(in oklab, var(--signal) 14%, transparent)"
                          : r.issues > 2
                          ? "color-mix(in oklab, var(--rose) 14%, transparent)"
                          : "color-mix(in oklab, var(--amber) 14%, transparent)",
                        color: r.issues === 0 ? "var(--signal)" : r.issues > 2 ? "var(--rose)" : "var(--amber)",
                      }}
                    >
                      {r.issues}
                    </span>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-ink-subtle">
                    Keine Seiten in dieser Ansicht.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass ring-aurora rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{label}</p>
      <p className="text-display text-3xl font-semibold tabular-nums mt-1">{formatNumber(value)}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = {
    indexable: { c: "var(--signal)", label: "Indexierbar" },
    noindex: { c: "var(--amber)", label: "Noindex" },
    blocked: { c: "var(--rose)", label: "Blockiert" },
    redirect: { c: "var(--chart-2)", label: "Redirect" },
  }[status];
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider"
      style={{ background: `color-mix(in oklab, ${cfg.c} 14%, transparent)`, color: cfg.c }}
    >
      {cfg.label}
    </span>
  );
}