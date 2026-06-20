import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  FileBarChart,
  GripVertical,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Mail,
  Palette,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Chip, IconButton, Panel, Pill, SegmentedControl, Td, Th } from "@/components/app/Atoms";

export const Route = createFileRoute("/project/$projectId/reports")({
  head: () => ({
    meta: [
      { title: "Report Builder — Verity" },
      { name: "description", content: "Drag, schedule and white-label reports your clients actually open." },
    ],
  }),
  component: Page,
});

type BlockId = "title" | "kpi" | "chart" | "table" | "text" | "image" | "link" | "ai";

interface Block {
  id: string;
  type: BlockId;
  title: string;
  subtitle: string;
  badge?: string;
}

const BLOCK_LIBRARY: { type: BlockId; label: string; icon: typeof BarChart3; title: string; subtitle: string; badge?: string }[] = [
  { type: "title", label: "Titel", icon: Type, title: "Titelblock", subtitle: "Berichtstitel & Logo" },
  { type: "kpi", label: "KPI-Strip", icon: BarChart3, title: "KPI-Strip", subtitle: "Traffic · Keywords · Backlinks · AI Mentions" },
  { type: "chart", label: "Line Chart", icon: Activity, title: "Organischer Traffic", subtitle: "Letzte 30 Tage vs. Vorperiode" },
  { type: "table", label: "Tabelle", icon: LayoutTemplate, title: "Top Mover", subtitle: "20 Keywords mit größter Positionsveränderung" },
  { type: "text", label: "Text", icon: Type, title: "Kommentar", subtitle: "Freier Textblock" },
  { type: "image", label: "Bild", icon: ImageIcon, title: "Bild / Screenshot", subtitle: "Visuelle Beilage" },
  { type: "link", label: "Linkliste", icon: Link2, title: "Empfohlene Maßnahmen", subtitle: "Cross-Links auf interne Reports" },
  { type: "ai", label: "AI Summary", icon: Sparkles, title: "AI Zusammenfassung", subtitle: "Monatskommentar, automatisch generiert", badge: "AI" },
];

const TEMPLATES = [
  { id: "exec", title: "Executive Summary", desc: "Einseitiger Snapshot für Stakeholder", icon: FileBarChart, color: "var(--series-1)", blocks: ["title", "kpi", "chart", "ai"] as BlockId[] },
  { id: "monthly", title: "Monthly SEO", desc: "Traffic, Keywords, Backlinks · automatisiert", icon: Calendar, color: "var(--series-2)", blocks: ["title", "kpi", "chart", "table", "ai"] as BlockId[] },
  { id: "audit", title: "Site Audit Brief", desc: "Tech-Issues priorisiert nach Impact", icon: Activity, color: "var(--series-3)", blocks: ["title", "kpi", "table", "link"] as BlockId[] },
  { id: "comp", title: "Competitive Pulse", desc: "Share of Voice vs. 3 Wettbewerber", icon: Compass, color: "var(--series-4)", blocks: ["title", "chart", "table", "ai"] as BlockId[] },
  { id: "ai", title: "AI Visibility", desc: "Zitationen über LLMs", icon: Sparkles, color: "var(--ai-accent)", blocks: ["title", "kpi", "chart", "ai"] as BlockId[] },
  { id: "blank", title: "Blank Canvas", desc: "Von Null bauen", icon: LayoutTemplate, color: "var(--status-neutral)", blocks: ["title"] as BlockId[] },
];

const INITIAL_SCHEDULED = [
  { id: "s1", name: "Acme Corp · Monthly", client: "acme.com", cadence: "Monthly", next: "1. Jul", status: "active" as const, last: "1. Jun", recipients: 3 },
  { id: "s2", name: "ZEIT Digital · Weekly", client: "zeit.de", cadence: "Weekly", next: "Mo", status: "active" as const, last: "Gestern", recipients: 5 },
  { id: "s3", name: "Indie SaaS · Exec", client: "indie-saas.io", cadence: "Monthly", next: "14. Jul", status: "draft" as const, last: "—", recipients: 1 },
  { id: "s4", name: "Luxus Shop · Audit", client: "luxus-shop.de", cadence: "Quarterly", next: "1. Okt", status: "paused" as const, last: "1. Apr", recipients: 2 },
];

let nextBlockId = 1;
function makeBlock(type: BlockId): Block {
  const lib = BLOCK_LIBRARY.find((b) => b.type === type)!;
  return { id: `b${nextBlockId++}`, type, title: lib.title, subtitle: lib.subtitle, badge: lib.badge };
}

function Page() {
  const [view, setView] = useState<"templates" | "scheduled" | "builder">("templates");
  const [blocks, setBlocks] = useState<Block[]>(() => ["title", "kpi", "chart", "table", "ai"].map((t) => makeBlock(t as BlockId)));
  const [dragId, setDragId] = useState<string | null>(null);
  const [brand, setBrand] = useState({ name: "Acme Corp", accent: "#22c55e", theme: "light" as "light" | "dark", logo: "ACM" });
  const [scheduled, setScheduled] = useState(INITIAL_SCHEDULED);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function useTemplate(t: typeof TEMPLATES[number]) {
    setBlocks(t.blocks.map(makeBlock));
    setView("builder");
  }

  function addBlock(type: BlockId) {
    setBlocks((bs) => [...bs, makeBlock(type)]);
  }

  function removeBlock(id: string) {
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  }

  function moveBlock(fromId: string, toId: string) {
    if (fromId === toId) return;
    setBlocks((bs) => {
      const from = bs.findIndex((b) => b.id === fromId);
      const to = bs.findIndex((b) => b.id === toId);
      if (from < 0 || to < 0) return bs;
      const next = [...bs];
      const [m] = next.splice(from, 1);
      next.splice(to, 0, m);
      return next;
    });
  }

  return (
    <AppShell title="Report Builder" subtitle="Templates, Scheduling und ein funktionaler Drag-and-Drop-Canvas.">
      <div className="flex flex-col gap-6">
        <section className="glass ring-aurora rounded-2xl p-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { id: "templates", label: "Templates" },
              { id: "scheduled", label: "Scheduled" },
              { id: "builder", label: "Builder" },
            ]}
          />
          <div className="flex items-center gap-2 justify-end shrink-0">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs">
              <Search className="size-3.5 text-ink-subtle" />
              <input placeholder="Berichte durchsuchen…" className="bg-transparent outline-none placeholder:text-ink-subtle" />
            </div>
            <Pill onClick={() => { setBlocks([makeBlock("title")]); setView("builder"); }}>
              <Plus className="size-3.5" /> Neuer Bericht
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
                  onClick={() => useTemplate(t)}
                  className="glass ring-aurora rounded-2xl p-5 text-left flex flex-col gap-3 hover:-translate-y-0.5 transition-all"
                  style={{ boxShadow: `inset 3px 0 0 ${t.color}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="size-10 rounded-xl grid place-items-center shrink-0"
                      style={{ background: `color-mix(in oklab, ${t.color} 14%, transparent)`, color: t.color }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <Chip>Template laden</Chip>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-display text-base font-semibold truncate">{t.title}</h3>
                    <p className="text-xs text-ink-muted mt-1">{t.desc}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap text-[10px] text-mono text-ink-subtle">
                    {t.blocks.slice(0, 4).map((b, i) => (
                      <span key={i} className="rounded bg-muted/60 px-1.5 py-0.5 uppercase tracking-wider">{b}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </section>
        )}

        {view === "scheduled" && (
          <Panel
            title="Geplante Berichte"
            subtitle={`${scheduled.length} Berichte über alle Kunden`}
            action={
              <Pill onClick={() => setScheduleOpen(true)}>
                <Plus className="size-3.5" /> Schedule
              </Pill>
            }
          >
            <div className="-mx-2 overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="border-b border-border">
                    <Th>Name</Th>
                    <Th>Kunde</Th>
                    <Th>Cadence</Th>
                    <Th>Empfänger</Th>
                    <Th>Zuletzt</Th>
                    <Th>Nächster Lauf</Th>
                    <Th>Status</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {scheduled.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/40">
                      <Td className="font-medium">{s.name}</Td>
                      <Td className="text-ink-muted font-mono text-xs">{s.client}</Td>
                      <Td>{s.cadence}</Td>
                      <Td className="tabular-nums">{s.recipients}</Td>
                      <Td className="text-ink-subtle">{s.last}</Td>
                      <Td>{s.next}</Td>
                      <Td><StatusBadge status={s.status} /></Td>
                      <Td>
                        <div className="flex items-center gap-1 justify-end">
                          <IconButton title="Jetzt senden">
                            <Send className="size-3.5" />
                          </IconButton>
                          <IconButton title="Herunterladen">
                            <Download className="size-3.5" />
                          </IconButton>
                          <IconButton title="Entfernen" onClick={() => setScheduled((rs) => rs.filter((r) => r.id !== s.id))}>
                            <Trash2 className="size-3.5" />
                          </IconButton>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {view === "builder" && (
          <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_280px] gap-4">
            <Panel title="Blöcke" subtitle="Anklicken oder ins Canvas ziehen">
              <ul className="flex flex-col gap-1.5">
                {BLOCK_LIBRARY.map((b) => {
                  const Icon = b.icon;
                  return (
                    <li
                      key={b.type}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/lovable-block", b.type); }}
                      onClick={() => addBlock(b.type)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 px-3 py-2 text-xs hover:border-foreground/40 hover:bg-muted/40 cursor-grab active:cursor-grabbing transition"
                    >
                      <GripVertical className="size-3 text-ink-subtle shrink-0" />
                      <Icon className="size-3.5 text-ink-muted shrink-0" />
                      <span className="font-medium truncate">{b.label}</span>
                      <Plus className="size-3 ml-auto text-ink-subtle" />
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel
              title="Canvas"
              subtitle={`${blocks.length} Blöcke · Reihenfolge per Drag & Drop`}
              action={<span className="text-[11px] text-mono text-ink-subtle">{brand.name}</span>}
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const type = e.dataTransfer.getData("text/lovable-block") as BlockId;
                  if (type) addBlock(type);
                }}
                className="rounded-xl border border-dashed border-border bg-surface-2/60 p-4 flex flex-col gap-2 min-h-[480px]"
              >
                {blocks.length === 0 && (
                  <div className="flex-1 grid place-items-center text-xs text-ink-subtle text-center px-6 py-12">
                    Ziehe Blöcke aus der linken Spalte hierher, um Deinen Bericht zu bauen.
                  </div>
                )}
                {blocks.map((b) => (
                  <CanvasBlock
                    key={b.id}
                    block={b}
                    accent={brand.accent}
                    isDragging={dragId === b.id}
                    onDragStart={() => setDragId(b.id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragId) moveBlock(dragId, b.id); }}
                    onRemove={() => removeBlock(b.id)}
                  />
                ))}
                <button
                  onClick={() => addBlock("text")}
                  className="self-center mt-2 inline-flex items-center gap-1.5 text-xs text-ink-subtle hover:text-foreground border border-dashed border-border rounded-lg px-3 py-1.5"
                >
                  <Plus className="size-3" /> Block hinzufügen
                </button>
              </div>
            </Panel>

            <Panel title="White-Label">
              <div className="flex flex-col gap-3 text-sm">
                <SettingInput label="Kundenname" value={brand.name} onChange={(v) => setBrand((b) => ({ ...b, name: v }))} />
                <SettingInput label="Logo-Initialen" value={brand.logo} onChange={(v) => setBrand((b) => ({ ...b, logo: v.slice(0, 3).toUpperCase() }))} />
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Brand-Farbe</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brand.accent}
                      onChange={(e) => setBrand((b) => ({ ...b, accent: e.target.value }))}
                      className="h-9 w-12 rounded border border-border bg-surface-2 cursor-pointer"
                    />
                    <input
                      value={brand.accent}
                      onChange={(e) => setBrand((b) => ({ ...b, accent: e.target.value }))}
                      className="flex-1 h-9 rounded-md border border-border bg-background px-2 text-xs font-mono"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Theme</span>
                  <SegmentedControl
                    value={brand.theme}
                    onChange={(v) => setBrand((b) => ({ ...b, theme: v }))}
                    options={[{ id: "light", label: "Light" }, { id: "dark", label: "Dark" }]}
                  />
                </label>
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <Palette className="size-3.5" /> Vorschau
                  </button>
                  <button
                    onClick={() => setScheduleOpen(true)}
                    className="w-full rounded-lg border border-border bg-surface-2 py-2 text-xs font-medium hover:bg-muted/70 inline-flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="size-3.5" /> Schedule…
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      {scheduleOpen && (
        <ScheduleModal
          onClose={() => setScheduleOpen(false)}
          onSubmit={(s) => {
            setScheduled((rs) => [{ id: `s${rs.length + 1}`, ...s }, ...rs]);
            setScheduleOpen(false);
            setView("scheduled");
          }}
        />
      )}

      {previewOpen && (
        <PreviewModal brand={brand} blocks={blocks} onClose={() => setPreviewOpen(false)} />
      )}
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

function CanvasBlock({
  block,
  accent,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRemove,
}: {
  block: Block;
  accent: string;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group flex items-center gap-3 rounded-xl bg-background border border-border px-4 py-3 hover:border-foreground/30 transition ${isDragging ? "opacity-40" : ""}`}
    >
      <GripVertical className="size-4 text-ink-subtle shrink-0 cursor-grab" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">{block.title}</span>
          <span className="text-[9px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5 bg-muted/70 text-ink-muted">{block.type}</span>
          {block.badge && (
            <span className="text-[9px] font-mono uppercase tracking-wider rounded px-1.5 py-0.5" style={{ background: "var(--ai-accent-bg)", color: "var(--ai-accent)" }}>
              {block.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-subtle truncate">{block.subtitle}</p>
      </div>
      <div className="hidden sm:block h-1 w-12 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: "75%", background: `linear-gradient(90deg, ${accent}, var(--series-2))` }} />
      </div>
      <button onClick={onRemove} className="text-ink-subtle hover:text-foreground opacity-0 group-hover:opacity-100 transition" title="Entfernen">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function SettingInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-border bg-background px-2.5 text-xs"
      />
    </label>
  );
}

function ScheduleModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (s: { name: string; client: string; cadence: string; next: string; status: "active" | "draft" | "paused"; last: string; recipients: number }) => void;
}) {
  const [name, setName] = useState("Neuer Bericht");
  const [client, setClient] = useState("example.com");
  const [cadence, setCadence] = useState("Monthly");
  const [recipients, setRecipients] = useState("ops@example.com");
  const [day, setDay] = useState("1");
  const recCount = useMemo(() => recipients.split(",").map((s) => s.trim()).filter(Boolean).length, [recipients]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-display font-semibold text-base">Bericht planen</h3>
            <p className="text-xs text-ink-subtle">Automatischer Versand per Email & Web-Link</p>
          </div>
          <button onClick={onClose} className="text-ink-subtle hover:text-foreground"><X className="size-4" /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              name,
              client,
              cadence,
              next: cadence === "Weekly" ? "Mo" : cadence === "Quarterly" ? "1. Okt" : `${day}. ${nextMonth()}`,
              status: "active",
              last: "—",
              recipients: recCount,
            });
          }}
          className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
        >
          <SettingInput label="Berichtsname" value={name} onChange={setName} />
          <SettingInput label="Kunden-Domain" value={client} onChange={setClient} />
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Cadence</span>
            <select value={cadence} onChange={(e) => setCadence(e.target.value)} className="h-9 rounded-md border border-border bg-background px-2.5 text-xs">
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Quarterly</option>
            </select>
          </label>
          <SettingInput label="Tag des Monats" value={day} onChange={setDay} />
          <label className="sm:col-span-2 flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Empfänger (Komma-separiert) · {recCount}</span>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              rows={2}
              className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"
            />
          </label>
          <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs">Abbrechen</button>
            <button type="submit" className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Aktivieren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function nextMonth() {
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const d = new Date();
  return months[(d.getMonth() + 1) % 12];
}

function PreviewModal({
  brand,
  blocks,
  onClose,
}: {
  brand: { name: string; accent: string; theme: "light" | "dark"; logo: string };
  blocks: Block[];
  onClose: () => void;
}) {
  const isDark = brand.theme === "dark";
  const bg = isDark ? "#0b0f14" : "#ffffff";
  const fg = isDark ? "#e5e7eb" : "#111827";
  const sub = isDark ? "#9ca3af" : "#6b7280";
  const surface = isDark ? "#111722" : "#f8fafc";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-background border border-border shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-ink-subtle" />
            <h3 className="text-sm font-semibold">White-Label Vorschau</h3>
            <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider rounded bg-muted/60 px-1.5 py-0.5">{brand.theme}</span>
          </div>
          <div className="flex items-center gap-2">
            <Pill><Download className="size-3.5" /> PDF</Pill>
            <button onClick={onClose} className="text-ink-subtle hover:text-foreground"><X className="size-4" /></button>
          </div>
        </div>
        <div className="overflow-y-auto p-6" style={{ background: surface }}>
          <div className="mx-auto max-w-2xl rounded-xl shadow-lg overflow-hidden" style={{ background: bg, color: fg }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}` }}>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg grid place-items-center text-xs font-bold" style={{ background: brand.accent, color: "#fff" }}>{brand.logo}</div>
                <div>
                  <div className="text-sm font-semibold">{brand.name}</div>
                  <div className="text-[11px]" style={{ color: sub }}>Monatlicher SEO-Bericht</div>
                </div>
              </div>
              <div className="text-[11px]" style={{ color: sub }}>{new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {blocks.map((b) => (
                <div key={b.id} className="rounded-lg p-4" style={{ background: surface, borderLeft: `3px solid ${brand.accent}` }}>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: brand.accent }}>{b.type}</div>
                  <div className="text-sm font-semibold mt-1">{b.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: sub }}>{b.subtitle}</div>
                </div>
              ))}
              {blocks.length === 0 && <div className="text-xs text-center py-8" style={{ color: sub }}>Keine Blöcke im Bericht.</div>}
            </div>
            <div className="px-6 py-3 text-[10px] uppercase tracking-wider flex items-center justify-between" style={{ borderTop: `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}`, color: sub }}>
              <span>Erstellt mit Verity</span>
              <span style={{ color: brand.accent }}>{brand.name.toLowerCase().replace(/\s+/g, "")}.report.verity.app</span>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <Pill onClick={onClose}><Mail className="size-3.5" /> Testmail senden</Pill>
        </div>
      </div>
    </div>
  );
}
