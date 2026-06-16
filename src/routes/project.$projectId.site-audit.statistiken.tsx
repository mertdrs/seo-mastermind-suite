import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Clock, Files, Link2, ListTree, Settings2 } from "lucide-react";
import { ChartTooltip, Panel, Pill, Td, Th } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/site-audit/statistiken")({
  component: Page,
});

const CRAWL_STATS = [
  { label: "Analysierte Seiten", value: 17, total: 18, color: "var(--signal)" },
  { label: "Nicht analysierte Seiten", value: 1, total: 18, color: "var(--ink-subtle)" },
  { label: "Erlaubt durch robots.txt", value: 18, total: 18, color: "var(--chart-2)" },
];

const FOUND = [
  { label: "Gecrawlte Seiten", v: 18 },
  { label: "Gefundene Seiten", v: 18 },
  { label: "Gefundene Dateien", v: 0 },
  { label: "Gefundene Sitemaps", v: 1 },
  { label: "Gefundene Links extern", v: 25 },
  { label: "Gefundene Weiterleitungen", v: 0 },
  { label: "Gefundene Nofollow-Seiten", v: 0 },
  { label: "Fragwürdige Seiten-URLs", v: 0 },
  { label: "Nicht analysierbare Content-Types", v: 0 },
  { label: "Seiten mit Google Ranking", v: 0 },
];

const DEPTH = [
  { d: "0", v: 1 },
  { d: "1", v: 7 },
  { d: "2", v: 6 },
  { d: "3", v: 3 },
  { d: "4", v: 1 },
  { d: "5+", v: 0 },
];

const TTFB = [
  { b: "<100ms", v: 4, color: "var(--signal)" },
  { b: "100-300", v: 9, color: "var(--signal)" },
  { b: "300-600", v: 3, color: "var(--amber)" },
  { b: "600-1000", v: 1, color: "var(--amber)" },
  { b: ">1s", v: 1, color: "var(--rose)" },
];

const STATUS_CODES = [
  { code: "200 OK", count: 16, color: "var(--signal)" },
  { code: "301 Moved", count: 1, color: "var(--chart-2)" },
  { code: "404 Not Found", count: 1, color: "var(--rose)" },
];

function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard label="Gecrawlte Seiten" value={18} />
        <KpiCard label="Externe Links" value={25} icon={<Link2 className="size-4" />} />
        <KpiCard label="Eingebundene Dateien" value={0} icon={<Files className="size-4" />} />
      </div>

      <Panel
        title="Crawling-Limits"
        subtitle="Eingestellte Limits"
        action={<Pill><Settings2 className="size-3.5" />Einstellungen</Pill>}
      >
        <div className="rounded-lg border border-border bg-[color:color-mix(in_oklab,var(--chart-2)_8%,transparent)] p-3 mb-4 text-xs text-ink-muted">
          Die Limits können sich darauf auswirken, wie treffend deine Crawling-Ergebnisse sind. Ändere die Limits in den Projekteinstellungen.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LimitTile label="Max. Seiten" used={18} max={1000} />
          <LimitTile label="Max. externe Links" used={25} max={100} />
          <LimitTile label="Max. eingebundene Dateien" used={0} max={100} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Verwendeter User-Agent</span>
            <Pill>Verity</Pill>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">Crawling-Modus</span>
            <Pill>Standard (ohne JavaScript)</Pill>
          </div>
        </div>
      </Panel>

      <Panel title="Crawling-Statistiken" subtitle="Crawling #41 · Fertig · Dauer 00:01:57">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-4">
            <HealthRing score={94} size={140} />
            <div className="w-full space-y-2">
              {CRAWL_STATS.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-mono tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {FOUND.map((f) => (
                  <tr key={f.label} className="border-b border-border/60">
                    <Td className="text-ink-muted">{f.label}</Td>
                    <Td align="right" className="font-mono tabular-nums">{f.v}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex justify-end">
              <Pill>Vergangene Crawlings</Pill>
            </div>
          </div>
        </div>
      </Panel>

      <Section title="Verteilung der Klicktiefe" hint="Max. Tiefe: 4">
        <div className="h-44">
          <ResponsiveContainer>
            <BarChart data={DEPTH}>
              <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="v" fill="var(--signal)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="Verteilung der Antwortzeit" hint="Durchschnitt 138ms" icon={<Clock className="size-4 text-ink-muted" />}>
        <div className="h-44">
          <ResponsiveContainer>
            <BarChart data={TTFB}>
              <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
              <XAxis dataKey="b" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                {TTFB.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title="HTTP Statuscodes" hint={`${STATUS_CODES.reduce((s, c) => s + c.count, 0)} Statuscodes`} icon={<ListTree className="size-4 text-ink-muted" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={STATUS_CODES} dataKey="count" nameKey="code" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {STATUS_CODES.map((s, i) => (
                    <Cell key={i} fill={s.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>Statuscode</Th>
                <Th align="right">Anzahl</Th>
              </tr>
            </thead>
            <tbody>
              {STATUS_CODES.map((s) => (
                <tr key={s.code} className="border-b border-border/60">
                  <Td>
                    <span className="inline-flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      <span className="font-mono text-xs">{s.code}</span>
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">{s.count}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="glass ring-aurora rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="text-display text-base font-semibold">{title}</h3>
          {hint && <span className="text-xs text-ink-subtle">— {hint}</span>}
        </div>
        <ChevronDown className={cn("size-4 text-ink-subtle transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="glass ring-aurora rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{label}</p>
        {icon && <span className="text-ink-subtle">{icon}</span>}
      </div>
      <p className="text-display text-3xl font-semibold tabular-nums mt-1">{formatNumber(value)}</p>
    </div>
  );
}

function LimitTile({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = Math.min(100, (used / max) * 100);
  return (
    <div className="rounded-xl border border-border bg-surface-2/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-ink-muted">{label}</span>
        <span className="text-display text-sm font-semibold tabular-nums">{formatNumber(max)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--signal)" }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-ink-subtle text-mono">
        <span>{formatNumber(used)} verbraucht</span>
        <button className="hover:text-foreground underline-offset-2 hover:underline">Limit ändern</button>
      </div>
    </div>
  );
}