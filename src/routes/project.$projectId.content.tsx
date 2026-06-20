import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ExternalLink, Heart, Link2, MessageSquare, Search, Share2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ChartTooltip, Chip, IconButton, Panel, Pill, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { formatNumber } from "@/lib/format";

export const Route = createFileRoute("/project/$projectId/content")({
  head: () => ({
    meta: [
      { title: "Content Explorer — Verity" },
      { name: "description", content: "See which articles perform best on a topic, anywhere on the web." },
    ],
  }),
  component: Page,
});

const SORTS = [
  { id: "traffic", label: "Traffic" },
  { id: "shares", label: "Social" },
  { id: "backlinks", label: "Backlinks" },
] as const;

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

function generate(topic: string) {
  const r = seed(topic);
  const titles = [
    `The Complete Guide to ${topic} in 2026`,
    `How We 10x'd Our Output With ${topic}`,
    `${topic}: 12 Lessons From 50 Real Teams`,
    `Why ${topic} Is Eating SaaS`,
    `${topic} vs the Old Way: A Side-by-Side Benchmark`,
    `Building a ${topic} Workflow From Scratch`,
    `${topic}, Explained Like You're Five`,
    `An Honest Review of ${topic} (After 6 Months)`,
    `${topic} for Marketers: A Field Guide`,
    `The Anatomy of a Great ${topic} Strategy`,
    `${topic} Without the Hype`,
    `What Nobody Tells You About ${topic}`,
  ];
  const sources = ["nytimes.com","wired.com","techcrunch.com","theverge.com","stratechery.com",
    "smashingmagazine.com","arstechnica.com","theatlantic.com","fastcompany.com","hbr.org"];
  const articles = titles.map((t, i) => ({
    title: t,
    domain: sources[Math.floor(r() * sources.length)]!,
    url: `/article/${i}`,
    traffic: Math.round(800 + r() * 220_000),
    shares: Math.round(40 + r() * 18_000),
    backlinks: Math.round(5 + r() * 1_800),
    fb: Math.round(20 + r() * 9_000),
    x: Math.round(10 + r() * 4_000),
    words: Math.round(800 + r() * 4_200),
    dr: Math.round(35 + r() * 60),
    publishedDays: Math.round(2 + r() * 720),
  }));
  const ageBuckets = [
    { name: "<30d", count: articles.filter((a) => a.publishedDays < 30).length },
    { name: "30-90d", count: articles.filter((a) => a.publishedDays >= 30 && a.publishedDays < 90).length },
    { name: "90-180d", count: articles.filter((a) => a.publishedDays >= 90 && a.publishedDays < 180).length },
    { name: "180-365d", count: articles.filter((a) => a.publishedDays >= 180 && a.publishedDays < 365).length },
    { name: "1y+", count: articles.filter((a) => a.publishedDays >= 365).length },
  ];
  return { articles, ageBuckets };
}

function Page() {
  const [draft, setDraft] = useState("ai writing tools");
  const [topic, setTopic] = useState(draft);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("traffic");
  const [filter, setFilter] = useState<"all" | "evergreen" | "fresh">("all");
  const d = useMemo(() => generate(topic), [topic]);

  const sorted = useMemo(() => {
    const f = d.articles.filter((a) =>
      filter === "fresh" ? a.publishedDays < 90 : filter === "evergreen" ? a.publishedDays >= 365 : true,
    );
    return [...f].sort((a, b) => (b[sort] as number) - (a[sort] as number));
  }, [d, sort, filter]);

  const totals = useMemo(() => {
    return {
      traffic: d.articles.reduce((s, a) => s + a.traffic, 0),
      shares: d.articles.reduce((s, a) => s + a.shares, 0),
      backlinks: d.articles.reduce((s, a) => s + a.backlinks, 0),
      avgWords: Math.round(d.articles.reduce((s, a) => s + a.words, 0) / d.articles.length),
    };
  }, [d]);

  return (
    <AppShell title="Content Explorer" subtitle={`Top content for "${topic}" across the open web`}>
      <div className="flex flex-col gap-6">
        <section className="glass ring-aurora rounded-2xl p-4 md:p-5 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) setTopic(draft.trim());
            }}
            className="flex flex-col lg:flex-row gap-3"
          >
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
              <Search className="size-4 text-ink-subtle" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Search a topic, phrase or URL…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-subtle"
              />
              <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold">
                Explore
              </button>
            </div>
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              options={[
                { id: "all", label: "All" },
                { id: "fresh", label: "Fresh (<90d)" },
                { id: "evergreen", label: "Evergreen (1y+)" },
              ]}
            />
          </form>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile label="Total Reach" value={formatNumber(totals.traffic)} hint="monthly traffic" />
          <KpiTile label="Total Shares" value={formatNumber(totals.shares)} hint="across networks" />
          <KpiTile label="Backlinks" value={formatNumber(totals.backlinks)} hint="earned links" />
          <KpiTile label="Avg. Length" value={formatNumber(totals.avgWords)} hint="words / article" />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Panel
            className="xl:col-span-2"
            title="Top Performing Articles"
            subtitle={`${sorted.length} pieces · sorted by ${SORTS.find((s) => s.id === sort)?.label}`}
            action={<SegmentedControl value={sort} onChange={setSort} options={SORTS.map((s) => ({ id: s.id, label: s.label }))} />}
          >
            <ul className="flex flex-col divide-y divide-border/60">
              {sorted.map((a, i) => (
                <li key={i} className="flex items-start gap-4 py-3">
                  <span className="text-[10px] font-mono w-6 text-right text-ink-subtle pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{a.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-ink-subtle">
                      <span className="font-mono">{a.domain}</span>
                      <span>·</span>
                      <span>{a.words.toLocaleString()} words</span>
                      <span>·</span>
                      <span>{a.publishedDays}d ago</span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-[11px] text-ink-muted">
                    <Stat icon={<Share2 className="size-3" />} value={formatNumber(a.shares)} />
                    <Stat icon={<Link2 className="size-3" />} value={formatNumber(a.backlinks)} />
                    <Stat icon={<Heart className="size-3" />} value={formatNumber(a.fb)} />
                    <Stat icon={<MessageSquare className="size-3" />} value={formatNumber(a.x)} />
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="text-sm font-mono tabular-nums">{formatNumber(a.traffic)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-ink-subtle">traffic</p>
                  </div>
                  <IconButton title="Open">
                    <ExternalLink className="size-3.5" />
                  </IconButton>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel title="Content Age" subtitle="Distribution of top articles">
              <div className="h-40 -mx-2">
                <ResponsiveContainer>
                  <BarChart data={d.ageBuckets}>
                    <CartesianGrid stroke="color-mix(in oklab, var(--ink) 6%, transparent)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--ink-subtle)" }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--series-5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Suggested Angles" subtitle="Underserved sub-topics">
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Beginner workflows for solo founders",
                  "ROI benchmarks vs traditional methods",
                  "Compliance & enterprise concerns",
                  "Open-source alternatives",
                  "Failure modes & honest critique",
                ].map((s) => (
                  <li key={s} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <span className="size-1.5 rounded-full" style={{ background: "var(--status-info)" }} />
                    <span className="flex-1">{s}</span>
                    <Chip>+</Chip>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function KpiTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="glass ring-aurora rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-mono text-ink-subtle">{label}</p>
      <p className="text-display text-2xl font-semibold tabular-nums mt-1">{value}</p>
      <p className="text-[11px] text-ink-subtle">{hint}</p>
    </div>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
      {icon}
      {value}
    </span>
  );
}
