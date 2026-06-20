import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
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
import { Globe2, Smartphone, Monitor, Tablet } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, Panel, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { MetricCard } from "@/components/app/V2";
import { PageTabs, RealtimeCard } from "@/components/app/V2Shared";
import { seriesColor } from "@/lib/tokens";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/web-analytics")({
  head: () => ({
    meta: [
      { title: "Web Analytics — Verity" },
      { name: "description", content: "Privacy-friendly site analytics: sessions, sources, devices, conversions." },
    ],
  }),
  component: Page,
});

function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate() {
  const r = seed("analytics-v1");
  const days = 30;
  const series = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const base = 4_200 + Math.sin(i / 4) * 600 + i * 30;
    return {
      date: date.toISOString().slice(5, 10),
      sessions: Math.round(base + (r() - 0.5) * 800),
      users: Math.round((base + (r() - 0.5) * 800) * 0.78),
      newUsers: Math.round((base + (r() - 0.5) * 800) * 0.42),
    };
  });
  const channels = [
    { name: "Organic Search", value: 48, color: seriesColor(0) },
    { name: "Direct", value: 22, color: seriesColor(1) },
    { name: "Social", value: 14, color: seriesColor(2) },
    { name: "Referral", value: 9, color: seriesColor(3) },
    { name: "Email", value: 5, color: seriesColor(4) },
    { name: "Paid", value: 2, color: seriesColor(5) },
  ];
  const countries = [
    { code: "🇺🇸", name: "United States", sessions: 48_220, share: 38.2 },
    { code: "🇩🇪", name: "Germany", sessions: 22_410, share: 17.7 },
    { code: "🇬🇧", name: "United Kingdom", sessions: 14_880, share: 11.8 },
    { code: "🇫🇷", name: "France", sessions: 9_640, share: 7.6 },
    { code: "🇳🇱", name: "Netherlands", sessions: 6_220, share: 4.9 },
    { code: "🇨🇦", name: "Canada", sessions: 5_960, share: 4.7 },
    { code: "🇦🇺", name: "Australia", sessions: 4_120, share: 3.3 },
  ];
  const devices = [
    { name: "Desktop", value: 54, icon: Monitor },
    { name: "Mobile", value: 39, icon: Smartphone },
    { name: "Tablet", value: 7, icon: Tablet },
  ];
  const pages = [
    { url: "/blog/seo-guide", sessions: 18_240, bounce: 32, avg: "2:48", conv: 4.2 },
    { url: "/products/audit", sessions: 12_180, bounce: 28, avg: "3:12", conv: 6.8 },
    { url: "/learn/keyword-research", sessions: 9_640, bounce: 35, avg: "2:21", conv: 3.1 },
    { url: "/", sessions: 8_120, bounce: 41, avg: "1:54", conv: 2.4 },
    { url: "/pricing", sessions: 6_880, bounce: 22, avg: "3:48", conv: 11.2 },
    { url: "/case-studies/saas-growth", sessions: 5_420, bounce: 30, avg: "4:02", conv: 5.7 },
    { url: "/compare/alternatives", sessions: 4_820, bounce: 26, avg: "3:33", conv: 7.1 },
  ];
  return { series, channels, countries, devices, pages };
}

function Page() {
  const [metric, setMetric] = useState<"sessions" | "users" | "newUsers">("sessions");
  const [tab, setTab] = useState<"overview" | "sources" | "geo" | "devices" | "pages">("overview");
  const d = useMemo(() => generate(), []);

  const totals = useMemo(() => {
    return {
      sessions: d.series.reduce((s, x) => s + x.sessions, 0),
      users: d.series.reduce((s, x) => s + x.users, 0),
      newUsers: d.series.reduce((s, x) => s + x.newUsers, 0),
      bounce: 34.2,
      avg: "2:48",
      conv: 4.6,
    };
  }, [d]);

  return (
    <AppShell title="Web Analytics" subtitle="verity.app · letzte 30 Tage · cookieless">
      <div className="flex flex-col gap-6">
        <PageTabs
          value={tab}
          onChange={(id) => setTab(id as typeof tab)}
          tabs={[
            { id: "overview", label: "Übersicht", to: "" },
            { id: "sources", label: "Quellen", to: "" },
            { id: "geo", label: "Geo", to: "" },
            { id: "devices", label: "Geräte", to: "" },
            { id: "pages", label: "Seiten", to: "" },
          ]}
        />
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard label="Sitzungen" value={formatNumber(totals.sessions)} delta={{ value: 8.4 }} />
          <MetricCard label="Nutzer" value={formatNumber(totals.users)} delta={{ value: 6.1 }} />
          <MetricCard label="Neue Nutzer" value={formatNumber(totals.newUsers)} delta={{ value: 11.2 }} />
          <MetricCard label="Bounce Rate" value={`${totals.bounce}%`} metricKey="keywordDifficulty" delta={{ value: -1.8 }} />
          <MetricCard label="Ø Verweildauer" value={totals.avg} delta={{ value: 0.6 }} />
          <MetricCard label="Conversion" value={`${totals.conv}%`} delta={{ value: 0.8 }} />
        </section>

        {(tab === "overview" || tab === "sources") && (
        <Panel
          title="Traffic Over Time"
          subtitle="Daily aggregated traffic"
          action={
            <SegmentedControl
              value={metric}
              onChange={setMetric}
              options={[
                { id: "sessions", label: "Sessions" },
                { id: "users", label: "Users" },
                { id: "newUsers", label: "New" },
              ]}
            />
          }
        >
          <div className="h-72 -mx-2">
            <ResponsiveContainer>
              <AreaChart data={d.series}>
                <defs>
                  <linearGradient id="wa-cur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={42} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey={metric} stroke="var(--series-1)" strokeWidth={2.5} fill="url(#wa-cur)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        )}

        {(tab === "overview" || tab === "sources" || tab === "geo" || tab === "devices") && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {(tab === "overview" || tab === "sources") && (
          <Panel title="Traffic-Kanäle" subtitle="Anteil nach Quelle">
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={d.channels} dataKey="value" innerRadius={42} outerRadius={70} stroke="none" paddingAngle={2}>
                    {d.channels.map((c, i) => (
                      <Cell key={i} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 text-xs">
              {d.channels.map((c) => (
                <li key={c.name} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 text-ink-muted">{c.name}</span>
                  <span className="font-mono tabular-nums">{c.value}%</span>
                </li>
              ))}
            </ul>
          </Panel>
          )}

          {(tab === "overview" || tab === "geo") && (
          <Panel title="Top-Länder" subtitle="Sitzungen nach Geografie">
            <ul className="flex flex-col gap-3 text-sm">
              {d.countries.map((c) => (
                <li key={c.code} className="flex items-center gap-3">
                  <span className="text-lg leading-none w-6">{c.code}</span>
                  <span className="flex-1 text-ink-muted truncate">{c.name}</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.share * 2.5}%`, background: "var(--series-2)" }} />
                  </div>
                  <span className="font-mono tabular-nums text-xs w-14 text-right">{formatNumber(c.sessions)}</span>
                </li>
              ))}
            </ul>
          </Panel>
          )}

          {(tab === "overview" || tab === "devices") && (
          <Panel title="Geräte" subtitle="Anteil je Gerätetyp">
            <div className="flex flex-col gap-3 mt-4">
              {d.devices.map((dev) => {
                const Icon = dev.icon;
                return (
                  <div key={dev.name} className="flex items-center gap-3">
                    <Icon className="size-4 text-ink-muted" />
                    <span className="flex-1 text-sm">{dev.name}</span>
                    <div className="w-32 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${dev.value}%`, background: "var(--series-1)" }} />
                    </div>
                    <span className="font-mono tabular-nums text-xs w-10 text-right">{dev.value}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-6">
              <RealtimeCard
                label="Realtime"
                value={<span>142 <span className="text-base text-ink-muted font-normal">aktiv</span></span>}
                hint="Top-Seite /blog/seo-guide · Referrer google.com"
              />
            </div>
          </Panel>
          )}
        </div>
        )}

        {(tab === "overview" || tab === "pages") && (
        <Panel title="Top Landing-Pages" subtitle="Einstiegsseiten mit dem meisten Traffic">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <Th>URL</Th>
                <Th align="right">Sitzungen</Th>
                <Th align="right">Bounce</Th>
                <Th align="right">Ø Dauer</Th>
                <Th align="right">Conversion</Th>
              </tr>
            </thead>
            <tbody>
              {d.pages.map((p) => (
                <tr key={p.url} className="border-b border-border/60 hover:bg-muted/40">
                  <Td className="font-mono text-xs">{p.url}</Td>
                  <Td align="right" className="font-mono tabular-nums">{formatNumber(p.sessions)}</Td>
                  <Td align="right">
                    <span className="font-mono tabular-nums text-xs" style={{ color: p.bounce < 30 ? "var(--status-success)" : p.bounce < 45 ? "var(--status-warning)" : "var(--status-error)" }}>
                      {p.bounce}%
                    </span>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">{p.avg}</Td>
                  <Td align="right">
                    <span className="font-mono tabular-nums text-xs font-semibold" style={{ color: "var(--status-success)" }}>
                      {p.conv}%
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        )}
      </div>
    </AppShell>
  );
}

