import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  Compass,
  Download,
  FileBarChart,
  GripVertical,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Mail,
  Plus,
  Search,
  Sparkles,
  Type,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Chip, IconButton, Panel, Pill, SegmentedControl, Td, Th } from "@/components/app/Atoms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/reports")({
  head: () => ({
    meta: [
      { title: "Report Builder — Verity" },
      { name: "description", content: "Drag, schedule and white-label reports your clients actually open." },
    ],
  }),
  component: Page,
});

const TEMPLATES = [
  { id: "exec", title: "Executive Summary", desc: "Einseitiger Snapshot für Stakeholder", icon: FileBarChart, color: "var(--series-1)" },
  { id: "monthly", title: "Monthly SEO", desc: "Traffic, Keywords, Backlinks · automatisiert", icon: Calendar, color: "var(--series-2)" },
  { id: "audit", title: "Site Audit Brief", desc: "Tech-Issues priorisiert nach Impact", icon: Activity, color: "var(--series-3)" },
  { id: "comp", title: "Competitive Pulse", desc: "Share of Voice vs. 3 Wettbewerber", icon: Compass, color: "var(--series-4)" },
  { id: "ai", title: "AI Visibility", desc: "Zitationen über LLMs", icon: Sparkles, color: "var(--ai-accent)" },
  { id: "blank", title: "Blank Canvas", desc: "Von Null bauen", icon: LayoutTemplate, color: "var(--status-neutral)" },
];

const SCHEDULED = [
  { name: "Acme Corp · Monthly", client: "acme.com", cadence: "Monthly", next: "Jul 1", status: "active", last: "Jun 1" },
  { name: "ZEIT Digital · Weekly", client: "zeit.de", cadence: "Weekly", next: "Mon", status: "active", last: "Yesterday" },
  { name: "Indie SaaS · Exec", client: "indie-saas.io", cadence: "Monthly", next: "Jul 14", status: "draft", last: "—" },
  { name: "Luxus Shop · Audit", client: "luxus-shop.de", cadence: "Quarterly", next: "Oct 1", status: "paused", last: "Apr 1" },
];

const BLOCKS = [
  { id: "kpi", label: "KPI Strip", icon: BarChart3 },
  { id: "chart", label: "Line Chart", icon: Activity },
  { id: "table", label: "Table", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "link", label: "Link list", icon: Link2 },
];

function Page() {
  const [view, setView] = useState<"templates" | "scheduled" | "builder">("templates");

  return (
    <AppShell title="Report Builder" subtitle="Templates, schedules and a live drag-and-drop canvas">
      <div className="flex flex-col gap-6">
        <section className="glass ring-aurora rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { id: "templates", label: "Templates" },
              { id: "scheduled", label: "Scheduled" },
              { id: "builder", label: "Builder" },
            ]}
          />
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs">
              <Search className="size-3.5 text-ink-subtle" />
              <input placeholder="Search reports…" className="bg-transparent outline-none placeholder:text-ink-subtle" />
            </div>
            <Pill>
              <Plus className="size-3.5" /> New report
            </Pill>
          </div>
        </section>

        {view === "templates" && (
          <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className="glass ring-aurora rounded-2xl p-5 text-left flex flex-col gap-3 hover:-translate-y-0.5 transition-all"
                  style={{ boxShadow: `inset 3px 0 0 ${t.color}` }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="size-10 rounded-xl grid place-items-center"
                      style={{ background: `color-mix(in oklab, ${t.color} 14%, transparent)`, color: t.color }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <Chip>Use template</Chip>
                  </div>
                  <div>
                    <h3 className="text-display text-base font-semibold">{t.title}</h3>
                    <p className="text-xs text-ink-muted mt-1">{t.desc}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-mono text-ink-subtle">
                    <span>PDF</span>
                    <span>·</span>
                    <span>Web link</span>
                    <span>·</span>
                    <span>Embed</span>
                  </div>
                </button>
              );
            })}
          </section>
        )}

        {view === "scheduled" && (
          <Panel title="Scheduled reports" subtitle={`${SCHEDULED.length} active reports across all clients`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <Th>Name</Th>
                  <Th>Client</Th>
                  <Th>Cadence</Th>
                  <Th>Last sent</Th>
                  <Th>Next run</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULED.map((s) => (
                  <tr key={s.name} className="border-b border-border/60 hover:bg-muted/40">
                    <Td className="font-medium">{s.name}</Td>
                    <Td className="text-ink-muted font-mono text-xs">{s.client}</Td>
                    <Td>{s.cadence}</Td>
                    <Td className="text-ink-subtle">{s.last}</Td>
                    <Td>{s.next}</Td>
                    <Td><StatusBadge status={s.status as any} /></Td>
                    <Td>
                      <div className="flex items-center gap-1 justify-end">
                        <IconButton title="Send now">
                          <Mail className="size-3.5" />
                        </IconButton>
                        <IconButton title="Download">
                          <Download className="size-3.5" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        )}

        {view === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4">
            <Panel title="Blocks">
              <ul className="flex flex-col gap-1.5">
                {BLOCKS.map((b) => {
                  const Icon = b.icon;
                  return (
                    <li
                      key={b.id}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2 text-xs hover:border-foreground/40 cursor-grab"
                    >
                      <GripVertical className="size-3 text-ink-subtle" />
                      <Icon className="size-3.5 text-ink-muted" />
                      <span className="font-medium">{b.label}</span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Canvas" subtitle="Drag blocks to compose your report">
              <div className="rounded-xl border border-dashed border-border bg-surface-2/60 p-5 flex flex-col gap-3 min-h-[480px]">
                <CanvasBlock title="Title block" subtitle="Acme Corp · Monthly SEO Report" />
                <CanvasBlock title="KPI Strip" subtitle="Traffic, Keywords, Backlinks, AI Mentions" />
                <CanvasBlock title="Organic Traffic chart" subtitle="Last 30 days vs previous" />
                <CanvasBlock title="Top movers table" subtitle="20 keywords with biggest position change" />
                <CanvasBlock title="AI Summary" subtitle="GPT-generated month-over-month commentary" badge="AI" />
                <button className="self-center mt-2 inline-flex items-center gap-1.5 text-xs text-ink-subtle hover:text-foreground border border-dashed border-border rounded-lg px-3 py-1.5">
                  <Plus className="size-3" /> Drop a block here
                </button>
              </div>
            </Panel>

            <Panel title="Settings">
              <div className="flex flex-col gap-3 text-sm">
                <Setting label="Theme" value="Verity Light" />
                <Setting label="Logo" value="acme-logo.svg" />
                <Setting label="Brand color" value="#22c55e" />
                <Setting label="Cadence" value="Monthly · 1st" />
                <Setting label="Delivery" value="PDF + Email" />
                <Setting label="Recipients" value="3 contacts" />
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <button className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold">
                    Preview
                  </button>
                  <button className="w-full rounded-lg border border-border bg-surface-2 py-2 text-xs font-medium hover:bg-muted/70">
                    Save draft
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "active" | "draft" | "paused" }) {
  const map = {
    active: { c: "var(--status-success)", label: "Aktiv" },
    draft: { c: "var(--status-info)", label: "Entwurf" },
    paused: { c: "var(--status-neutral)", label: "Pausiert" },
  };
  const v = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono rounded px-1.5 py-0.5"
      style={{ background: `color-mix(in oklab, ${v.c} 14%, transparent)`, color: v.c }}
    >
      <span className="size-1.5 rounded-full" style={{ background: v.c }} />
      {v.label}
    </span>
  );
}

function CanvasBlock({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-background border border-border px-4 py-3 hover:border-foreground/30 transition-colors">
      <GripVertical className="size-4 text-ink-subtle opacity-0 group-hover:opacity-100" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {badge && (
            <span className="text-[9px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5" style={{ background: "var(--ai-accent-bg)", color: "var(--ai-accent)" }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-subtle">{subtitle}</p>
      </div>
      <div className={cn("h-1 w-12 rounded-full bg-muted overflow-hidden")}>
        <div className="h-full rounded-full" style={{ width: "75%", background: "linear-gradient(90deg, var(--series-1), var(--series-2))" }} />
      </div>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-ink-subtle">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
