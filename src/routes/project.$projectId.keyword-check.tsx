import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill, ScoreBar } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
  PlayCircle,
  Settings2,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/project/$projectId/keyword-check")({
  head: () => ({
    meta: [
      { title: "Keyword Check — Verity" },
      {
        name: "description",
        content:
          "Prüfe, wie gut eine Seite für Dein Ziel-Keyword optimiert ist und erhalte konkrete Vorschläge.",
      },
    ],
  }),
  component: KeywordCheckPage,
});

type Tone = "pass" | "warn" | "fail" | "info";

interface Finding {
  title: string;
  detail: string;
  status: Tone;
}

const FINDINGS: { group: string; weight: number; items: Finding[] }[] = [
  {
    group: "Meta-Information",
    weight: 87,
    items: [
      {
        title: "Title-Tag",
        detail: "Keyword steht am Ende — bessere Position wäre der Anfang.",
        status: "warn",
      },
      {
        title: "Meta-Description",
        detail: "Keyword 1× enthalten, optimale Länge mit 152 Zeichen.",
        status: "pass",
      },
      {
        title: "URL",
        detail: "Keyword ist Teil der URL-Slug.",
        status: "pass",
      },
    ],
  },
  {
    group: "HTML-Optimierung",
    weight: 48,
    items: [
      {
        title: "H1-Überschrift",
        detail: "Keyword fehlt in der H1.",
        status: "fail",
      },
      {
        title: "H2/H3 Struktur",
        detail: "Keyword in 2 von 7 Zwischenüberschriften.",
        status: "warn",
      },
      {
        title: "Text-Vorkommen",
        detail: "12 Treffer · Dichte 1.4 %.",
        status: "pass",
      },
      {
        title: "Alt-Attribute",
        detail: "Keyword in 1 von 8 relevanten Bildern.",
        status: "warn",
      },
    ],
  },
  {
    group: "Sonstiges",
    weight: 34,
    items: [
      {
        title: "Strukturierte Daten",
        detail: "Kein Schema-Markup für das Hauptthema vorhanden.",
        status: "fail",
      },
      {
        title: "Interne Links",
        detail: "3 interne Links mit Keyword-Anker.",
        status: "pass",
      },
    ],
  },
];

function KeywordCheckPage() {
  const { projectId } = useParams({ from: "/project/$projectId/keyword-check" });
  const project = getProject(projectId);
  const [url, setUrl] = useState(project ? `https://${project.domain}/leistungen` : "");
  const [keyword, setKeyword] = useState("seo agentur");
  const [scanned, setScanned] = useState(true);

  const overall = 57;

  return (
    <AppShell
      title="Keyword Check"
      subtitle="Prüfe, wie gut eine Seite für ihr Ziel-Keyword optimiert ist."
    >
      <div className="flex flex-col gap-6">
        <Panel
          title="Seite prüfen"
          action={
            <span className="text-xs text-ink-subtle">
              Noch <strong className="text-foreground">4</strong> von 5 Checks heute möglich
            </span>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setScanned(true);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <Field label="URL">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.example.com/seite" />
            </Field>
            <Field label="Keyword">
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="z. B. seo agentur" />
            </Field>
            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                className="h-11 flex-1 gap-2 font-semibold"
                style={{
                  background: "linear-gradient(135deg, var(--signal), var(--chart-5))",
                  color: "var(--background)",
                }}
              >
                <PlayCircle className="size-4" /> Keyword-Optimierung prüfen
              </Button>
              <Button type="button" variant="outline" size="icon" className="h-11 w-11">
                <Settings2 className="size-4" />
              </Button>
            </div>
          </form>
        </Panel>

        {scanned && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel title="Keyword Score" subtitle={`Bewertung für „${keyword}"`}>
                <div className="flex flex-col items-center gap-3">
                  <HealthRing score={overall} label="Keyword Score" />
                  <div className="text-xs text-ink-muted text-center max-w-xs">
                    Optimierungspotenzial vorhanden — H1 und strukturierte Daten zuerst angehen.
                  </div>
                </div>
              </Panel>
              <Panel title="Auswertung pro Bereich" className="xl:col-span-2">
                <div className="space-y-3">
                  {FINDINGS.map((g) => (
                    <ScoreBar key={g.group} label={g.group} value={g.weight} />
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="size-3.5" /> Exportieren
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Target className="size-3.5" /> Sekundäre Keywords vorschlagen
                  </Button>
                </div>
              </Panel>
            </div>

            <Panel
              title="HTML-Seite"
              subtitle="Schnellüberblick über die analysierte URL"
              action={
                <a
                  href={url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-ink-muted hover:text-foreground inline-flex items-center gap-1.5"
                >
                  Seite öffnen <ExternalLink className="size-3" />
                </a>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
                <div className="aspect-[4/3] rounded-xl border border-border bg-surface-2 grid place-items-center text-ink-subtle text-xs">
                  Vorschau
                </div>
                <div className="space-y-3 text-sm">
                  <MetaRow label="Titel" value="Christliche Karten & Postkarten mit Bibelversen | Himmel im Herzen" />
                  <MetaRow
                    label="Description"
                    value="Shoppe jetzt unsere christlichen Postkarten und Karten mit Herz zu schönem Design, herzhaften Illustrationen und oft mit Bibelversen."
                  />
                  <MetaRow label="URL" value={url || "—"} mono />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <MicroStat label="Status" value="200" tone="pass" />
                    <MicroStat label="Response" value="1.24 s" />
                    <MicroStat label="Size" value="1.231 kB" />
                    <MicroStat label="Wörter" value="640" />
                  </div>
                </div>
              </div>
            </Panel>

            <div className="space-y-4">
              {FINDINGS.map((g) => (
                <GroupCard key={g.group} group={g.group} weight={g.weight} items={g.items} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">{label}</span>
      {children}
    </label>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle pt-0.5">{label}</span>
      <span className={mono ? "text-xs text-mono text-ink-muted break-all" : "text-sm text-foreground"}>{value}</span>
    </div>
  );
}

function MicroStat({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  const color = tone === "pass" ? "var(--signal)" : "var(--foreground)";
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mono text-ink-subtle">{label}</div>
      <div className="text-sm font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  weight,
  items,
}: {
  group: string;
  weight: number;
  items: Finding[];
}) {
  return (
    <Panel
      title={group}
      action={<span className="text-sm font-semibold tabular-nums">{weight}%</span>}
    >
      <div className="divide-y divide-border -mx-5">
        {items.map((f) => (
          <FindingRow key={f.title} f={f} />
        ))}
      </div>
    </Panel>
  );
}

function FindingRow({ f }: { f: Finding }) {
  const cfg = {
    pass: { color: "var(--signal)", Icon: CheckCircle2, label: "Bestanden" },
    warn: { color: "var(--amber)", Icon: AlertTriangle, label: "Warnung" },
    fail: { color: "var(--rose)", Icon: AlertCircle, label: "Fehler" },
    info: { color: "var(--violet)", Icon: Info, label: "Info" },
  }[f.status];
  const Icon = cfg.Icon;
  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <Icon className="size-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{f.title}</span>
          <span
            className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
            style={{
              background: `color-mix(in oklab, ${cfg.color} 14%, transparent)`,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="text-xs text-ink-muted mt-0.5">{f.detail}</div>
      </div>
    </div>
  );
}
