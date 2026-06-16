import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Link as LinkIcon, ListChecks, Paperclip, ShieldCheck } from "lucide-react";
import { ChartTooltip, Panel, Td, Th } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";

export const Route = createFileRoute("/project/$projectId/site-audit/reports")({
  component: Page,
});

const TREND = Array.from({ length: 30 }, (_, i) => ({
  d: i,
  tech: 80 + Math.round(Math.sin(i / 3) * 5 + Math.random() * 3),
  struct: 88 + Math.round(Math.cos(i / 4) * 4 + Math.random() * 2),
  inhalt: 72 + Math.round(Math.sin(i / 5) * 6 + Math.random() * 3),
}));

const REPORTS = {
  "Tech. & Meta": {
    score: 87,
    icon: ShieldCheck,
    groups: [
      {
        title: "Meta-Tags",
        items: [
          { label: "Technische Probleme", count: 0, delta: 0 },
          { label: "Probleme mit Seitentiteln", count: 6, delta: 0, highlight: true },
          { label: "Probleme mit Meta-Descriptions", count: 0, delta: 0 },
          { label: "Doppelte Seitentitel", count: 0, delta: 0 },
          { label: "Doppelte Meta-Descriptions", count: 0, delta: 0 },
          { label: "Falsche Sprachinformationen", count: 0, delta: 0 },
          { label: "Probleme mit Charset Encoding", count: 0, delta: 0 },
        ],
      },
      {
        title: "Seitenoptimierung & Richtlinien",
        items: [
          { label: "Probleme mit H1-Überschriften", count: 5, delta: 0, highlight: true },
          { label: "Probleme mit Überschriften", count: 5, delta: 0, highlight: true },
          { label: "Probleme mit Strong-/Bold-Tags", count: 0, delta: 0 },
          { label: "Seiten mit Frames", count: 0, delta: 0 },
          { label: "Fehlermeldungen im Quelltext", count: 0, delta: 0 },
          { label: "Seiten mit großer Dateigröße", count: 0, delta: 0 },
          { label: "Seiten ohne Komprimierung", count: 0, delta: 0 },
        ],
      },
    ],
  },
  "Struktur": {
    score: 92,
    icon: LinkIcon,
    groups: [
      {
        title: "Links",
        items: [
          { label: "Seiten mit vielen internen Links", count: 0, delta: 0 },
          { label: "Seiten mit wenigen internen Links", count: 0, delta: 0 },
          { label: "Weiterleitungen", count: 0, delta: 0 },
          { label: "Probleme mit externen Links", count: 1, delta: -2, highlight: true },
          { label: "Canonical Link Fehler", count: 0, delta: 0 },
          { label: "Alternate Link Fehler", count: 0, delta: 0 },
        ],
      },
      {
        title: "Linktexte",
        items: [
          { label: "Verbesserungswürdige interne Linktexte", count: 0, delta: 0, highlight: true },
          { label: "Identische Linktexte für unterschiedliche Seiten", count: 0, delta: 0 },
          { label: "Problematische URLs", count: 0, delta: 0 },
          { label: "Nur in Sitemaps gefundene URLs", count: 0, delta: 0 },
        ],
      },
    ],
  },
  "Inhalt": {
    score: 77,
    icon: FileText,
    groups: [
      {
        title: "Duplicate Content",
        items: [
          { label: "Seiten ohne Fließtext", count: 0, delta: 0 },
          { label: "Seiten ohne Keywordoptimierung", count: 0, delta: 0 },
          { label: "Inhalt auf mehreren Seiten vorhanden", count: 81, delta: 0, danger: true },
          { label: "Duplicate Content", count: 0, delta: 0 },
          { label: "Konkurrierende Seiten zum gleichen Keyword", count: 1, delta: -1, highlight: true },
          { label: "Identische HTML-Seiten", count: 0, delta: 0 },
        ],
      },
      {
        title: "Textqualität",
        items: [
          { label: "Seiten mit weniger Textblöcken", count: 4, delta: 0, highlight: true },
          { label: "Seiten mit sehr viel Text", count: 2, delta: 0 },
          { label: "Seiten mit wenig Text", count: 4, delta: 0, highlight: true },
          { label: "Seiten mit doppelten Textblöcken", count: 2, delta: 0 },
          { label: "Keywords aus Seitentitel nicht im Text", count: 0, delta: 0 },
          { label: "Keywords aus H1 nicht im Text", count: 2, delta: 0, highlight: true },
          { label: "Seiten mit Tippfehlern", count: 0, delta: 0 },
        ],
      },
    ],
  },
} as const;

function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Panel
        title="Onpage Score"
        subtitle="Tech. & Meta · Struktur · Inhalt — letzte 30 Tage"
        action={
          <div className="flex items-center gap-4 text-[11px] text-ink-muted">
            <LegendDot color="var(--signal)" label="Tech. & Meta" />
            <LegendDot color="var(--chart-2)" label="Struktur" />
            <LegendDot color="var(--amber)" label="Inhalt" />
          </div>
        }
      >
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={TREND} barCategoryGap={2}>
              <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="tech" stackId="a" fill="var(--signal)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="struct" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="inhalt" stackId="a" fill="var(--amber)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {Object.entries(REPORTS).map(([category, data]) => {
        const Icon = data.icon;
        return (
          <section key={category} className="glass ring-aurora rounded-2xl p-5 flex flex-col gap-4">
            <header className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Icon className="size-4 text-ink-muted" />
                <h3 className="text-display text-base font-semibold uppercase tracking-wide">{category}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-display text-2xl font-semibold tabular-nums">{data.score}%</span>
                <HealthRing score={data.score} size={42} stroke={5} hideLabel />
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.groups.map((g) => (
                <div key={g.title} className="rounded-xl border border-border bg-surface-2/40 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border text-[11px] text-mono uppercase tracking-wider text-ink-muted flex items-center gap-2">
                    <Paperclip className="size-3" /> {g.title}
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-mono uppercase tracking-wider text-ink-subtle">
                        <Th>Report</Th>
                        <Th align="right">Probleme</Th>
                        <Th align="right">± Probleme</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.items.map((it: any) => (
                        <tr
                          key={it.label}
                          className={
                            "border-t border-border/60 " +
                            (it.danger
                              ? "bg-[color:color-mix(in_oklab,var(--rose)_10%,transparent)]"
                              : it.highlight
                              ? "bg-[color:color-mix(in_oklab,var(--amber)_8%,transparent)]"
                              : "")
                          }
                        >
                          <Td className="text-ink">{it.label}</Td>
                          <Td align="right" className="font-mono tabular-nums">{it.count}</Td>
                          <Td align="right">
                            <DeltaPill v={it.delta} />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <footer className="flex items-center gap-4 text-[10px] text-mono uppercase tracking-wider text-ink-subtle">
              <LegendDot color="var(--rose)" label=">= 10 Probleme" />
              <LegendDot color="var(--amber)" label="<10 Probleme" />
              <LegendDot color="var(--signal)" label="Keine Probleme" />
            </footer>
          </section>
        );
      })}

      <div className="flex items-center gap-3">
        <ListChecks className="size-4 text-ink-subtle" />
        <p className="text-xs text-ink-muted">Klicke auf einen Report, um eine Liste betroffener Seiten zu öffnen.</p>
      </div>
    </div>
  );
}

function DeltaPill({ v }: { v: number }) {
  if (v === 0)
    return (
      <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono bg-muted/60 text-ink-subtle">—</span>
    );
  const positive = v > 0;
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-mono tabular-nums"
      style={{
        background: `color-mix(in oklab, ${positive ? "var(--rose)" : "var(--signal)"} 16%, transparent)`,
        color: positive ? "var(--rose)" : "var(--signal)",
      }}
    >
      {positive ? "+" : ""}
      {v}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}