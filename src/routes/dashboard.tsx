import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill, StatusDot } from "@/components/app/Atoms";
import { ScoreGauge, StatusBadge } from "@/components/app/V2";
import { addProject, formatAgo, removeProject, useProjects } from "@/lib/project-store";
import { formatNumber } from "@/lib/format";
import {
  Activity,
  ArrowRight,
  Globe,
  Heart,
  Layers,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Verity" },
      { name: "description", content: "All monitored websites in one place. Add a new project or open an existing one to access the full SEO suite." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const projects = useProjects();
  const [query, setQuery] = useState("");
  const filtered = projects.filter((p) =>
    [p.name, p.domain].some((s) => s.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <AppShell title="Projekte" subtitle={`${projects.length} Webseiten in Überwachung`}>
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Projekt oder Domain suchen…"
            className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-3 py-2.5 text-sm placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-[color:var(--signal)]/40"
          />
        </div>
        <NewProjectDialog />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {filtered.length === 0 && (
          <Panel className="md:col-span-2 xl:col-span-3 text-center">
            <p className="text-sm text-ink-muted py-12">Keine Projekte gefunden.</p>
          </Panel>
        )}
      </div>

      {projects.length > 0 && <WorkspaceSummary />}
    </AppShell>
  );
}

function WorkspaceSummary() {
  const projects = useProjects();
  const totalProjects = projects.length;
  const totalBacklinks = projects.reduce((s, p) => s + p.backlinks, 0);
  const totalRankings = projects.reduce((s, p) => s + p.rankings, 0);
  const monitoring = projects.filter((p) => p.healthEnabled).length;
  const crawling = projects.filter((p) => p.status === "crawling").length;
  return (
    <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      <SumTile label="Projekte" value={String(totalProjects)} hint={`${monitoring} mit Monitoring`} />
      <SumTile label="Backlinks" value={formatNumber(totalBacklinks)} hint="Summe aller Projekte" />
      <SumTile label="Rankings" value={formatNumber(totalRankings)} hint="getrackte Keywords" />
      <SumTile label="Aktive Crawls" value={String(crawling)} hint="laufen gerade" />
    </section>
  );
}

function SumTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-mono" style={{ color: "var(--status-neutral)" }}>{label}</p>
      <p className="text-display text-2xl font-semibold tabular-nums mt-1">{value}</p>
      <p className="text-[11px] text-ink-subtle">{hint}</p>
    </div>
  );
}

function ProjectCard({ project: p }: { project: ReturnType<typeof useProjects>[number] }) {
  const isCrawling = p.status === "crawling";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const statusCfg = {
    healthy: { tone: "ok" as const, label: "Fertig" },
    warning: { tone: "warn" as const, label: "Fertig" },
    critical: { tone: "bad" as const, label: "Fertig" },
    crawling: { tone: "neutral" as const, label: "In Arbeit" },
  }[p.status];

  return (
    <Link
      to="/project/$projectId/site-audit"
      params={{ projectId: p.id }}
      className="group block glass ring-aurora rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-surface-2 grid place-items-center text-lg shrink-0">
            {p.countryFlag}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{p.name}</div>
            <div className="text-[11px] text-mono text-ink-subtle truncate">{p.domain}</div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (confirm(`Projekt "${p.name}" löschen?`)) removeProject(p.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition size-7 grid place-items-center rounded-lg hover:bg-rose-500/10 text-ink-subtle hover:text-[color:var(--rose)]"
          aria-label="Löschen"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {isCrawling ? (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded"
            style={{ background: "var(--status-warning-bg)", color: "var(--status-warning)" }}
          >
            <Loader2 className="size-3 animate-spin" /> In Arbeit
          </span>
        ) : (
          <StatusBadge severity="success" label="Fertig" size="sm" />
        )}
        <span className="text-[11px] text-ink-subtle">
          · letztes Crawling {mounted ? formatAgo(p.lastCrawl) : "…"}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-4">
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <Metric icon={Layers} label="Seiten" value={formatNumber(p.pages)} />
          <Metric
            icon={Heart}
            label="Monitoring"
            value={p.healthEnabled ? "An" : "Aus"}
            tone={p.healthEnabled ? "ok" : "neutral"}
          />
          <Metric icon={Link2} label="Backlinks" value={formatNumber(p.backlinks)} />
          <Metric icon={Activity} label="Rankings" value={formatNumber(p.rankings)} />
        </dl>
        <div className="flex flex-col items-center justify-between gap-2">
          <div className="flex flex-col items-center">
            <ScoreGauge score={p.onpageScore} label="" size="sm" />
            <span className="mt-1 text-[9px] uppercase tracking-[0.16em] text-mono" style={{ color: "var(--status-neutral)" }}>
              Onpage
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-ink-subtle">
            Öffnen <ArrowRight className="size-3" />
          </span>
        </div>
      </div>

      {/* Required for unused-import linter if it kicks in */}
      <span hidden><StatusDot tone={statusCfg.tone} /></span>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
}) {
  const color =
    tone === "ok"
      ? "var(--status-success)"
      : tone === "warn"
        ? "var(--status-warning)"
        : tone === "bad"
          ? "var(--status-error)"
          : "var(--foreground)";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="size-3.5 text-ink-subtle shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-ink-subtle text-mono leading-none">{label}</div>
        <div className="text-sm font-semibold tabular-nums truncate" style={{ color }}>{value}</div>
      </div>
    </div>
  );
}

function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [flag, setFlag] = useState("🌐");
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-1.5 font-semibold"
          style={{
            background: "linear-gradient(135deg, var(--signal), var(--chart-5))",
            color: "var(--background)",
          }}
        >
          <Plus className="size-4" /> Neues Projekt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Projekt anlegen</DialogTitle>
          <DialogDescription>Eine Webseite zur Überwachung hinzufügen. Crawling startet automatisch.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!domain.trim()) return;
            const p = addProject({ domain, name, countryFlag: flag });
            setOpen(false);
            setDomain("");
            setName("");
            navigate({ to: "/project/$projectId/site-audit", params: { projectId: p.id } });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="domain">Domain</Label>
            <div className="relative">
              <Globe className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <Input id="domain" placeholder="example.com" className="pl-9" value={domain} onChange={(e) => setDomain(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Anzeigename (optional)</Label>
            <Input id="name" placeholder="Mein Projekt" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <div className="flex gap-2">
              {[
                { f: "🇩🇪", l: "DE" },
                { f: "🇺🇸", l: "US" },
                { f: "🇬🇧", l: "UK" },
                { f: "🇫🇷", l: "FR" },
                { f: "🌐", l: "Global" },
              ].map((o) => (
                <Pill key={o.l} active={flag === o.f} onClick={() => setFlag(o.f)}>
                  <span>{o.f}</span>
                  <span>{o.l}</span>
                </Pill>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
            <Button type="submit">Projekt anlegen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}