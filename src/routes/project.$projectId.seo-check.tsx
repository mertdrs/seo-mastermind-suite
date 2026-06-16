import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Globe,
  Info,
  Lock,
  PlayCircle,
  RefreshCcw,
  Search,
  Smartphone,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill, ScoreBar } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId/seo-check")({
  head: () => ({
    meta: [
      { title: "SEO Check — Verity" },
      { name: "description", content: "Tiefenanalyse einer einzelnen URL: Meta, Inhalt, Sicherheit, Links und Strukturdaten." },
    ],
  }),
  component: SeoCheckPage,
});

type Status = "pass" | "warn" | "fail" | "info";

interface Check {
  id: string;
  title: string;
  status: Status;
  detail?: string;
  evidence?: string[];
}

interface Section {
  id: string;
  title: string;
  weight: number; // 0–100 score
  checks: Check[];
}

const SECTIONS: Section[] = [
  {
    id: "meta",
    title: "Meta Angaben",
    weight: 100,
    checks: [
      { id: "title", title: "Titel", status: "pass", detail: "62 Zeichen — optimale Länge", evidence: ["Die Länge des Seitentitels ist optimal (zwischen 30 und 60 Zeichen).", "Keine Duplikate im Seitentitel erkannt."] },
      { id: "meta-desc", title: "Meta-Description", status: "pass", detail: "152 Zeichen", evidence: ["Die Meta-Description hat eine optimale Länge.", "Sie enthält das Haupt-Keyword."] },
      { id: "crawlability", title: "Crawlbarkeit", status: "pass", detail: "Keine robots.txt-Sperren auf dieser URL." },
      { id: "canonical", title: "Canonical-Tag", status: "warn", detail: "Canonical zeigt auf eine andere URL.", evidence: ["Aktuell: /home", "Erwartet: /"] },
      { id: "lang", title: "Sprache & hreflang", status: "pass", detail: "lang=\"de\" gesetzt, 3 hreflang-Varianten." },
      { id: "favicon", title: "Favicon", status: "pass", detail: "32×32 PNG erkannt." },
      { id: "viewport", title: "Viewport / Mobile", status: "pass", detail: "Responsive Meta-Tag korrekt." },
      { id: "charset", title: "Charset", status: "pass", detail: "UTF-8" },
      { id: "doctype", title: "Doctype", status: "pass", detail: "HTML5 erkannt." },
    ],
  },
  {
    id: "content",
    title: "Seitenqualität",
    weight: 68,
    checks: [
      { id: "h1", title: "Inhalt – H1-Überschrift", status: "fail", detail: "Es wurden 2 H1-Überschriften auf der Seite gefunden.", evidence: ["H1: \"Willkommen\"", "H1: \"Unsere Leistungen\""] },
      { id: "headings", title: "Überschriftenstruktur", status: "warn", detail: "Sprünge in der Hierarchie (H2 → H4)." },
      { id: "wordcount", title: "Wortzahl", status: "pass", detail: "812 Wörter — solide." },
      { id: "keyword-density", title: "Keyword-Dichte", status: "pass", detail: "Hauptkeyword: 1.4%, natürliche Verteilung." },
      { id: "images", title: "Bilder & Alt-Texte", status: "warn", detail: "3 von 24 Bildern ohne alt-Attribut." },
      { id: "internal-links", title: "Interne Verlinkung", status: "pass", detail: "18 interne Links, gut verteilt." },
      { id: "duplicate", title: "Duplicate Content", status: "pass", detail: "Keine internen Duplikate." },
      { id: "https", title: "HTTPS", status: "pass", detail: "HSTS, TLS 1.3" },
    ],
  },
  {
    id: "extras",
    title: "Sonstiges",
    weight: 75,
    checks: [
      { id: "structured-data", title: "Strukturierte Daten", status: "fail", detail: "Kein JSON-LD gefunden.", evidence: ["Empfohlene Typen: Organization, BreadcrumbList, WebPage."] },
      { id: "open-graph", title: "Open Graph", status: "warn", detail: "og:image fehlt." },
      { id: "twitter-card", title: "Twitter Card", status: "pass", detail: "summary_large_image" },
    ],
  },
  {
    id: "links-on-page",
    title: "Links auf der Seite",
    weight: 80,
    checks: [
      { id: "broken", title: "Defekte Links", status: "warn", detail: "1 externer Link liefert 404." },
      { id: "external-rel", title: "Externe Links · rel-Attribute", status: "pass", detail: "noopener gesetzt." },
      { id: "anchor", title: "Link-Texte", status: "pass", detail: "Keine generischen \"hier klicken\" Texte." },
    ],
  },
  {
    id: "server",
    title: "Serverkonfiguration",
    weight: 100,
    checks: [
      { id: "redirects", title: "HTTP-Weiterleitungen", status: "pass", detail: "1 Hop, 301 permanent." },
      { id: "ttfb", title: "TTFB", status: "pass", detail: "112 ms" },
      { id: "compression", title: "Komprimierung", status: "pass", detail: "Brotli aktiv." },
      { id: "http2", title: "HTTP/2", status: "pass", detail: "Aktiv mit Multiplexing." },
    ],
  },
  {
    id: "external",
    title: "Externe Faktoren",
    weight: 15,
    checks: [
      { id: "blacklist", title: "Blacklist-Check", status: "pass", detail: "Nicht gelistet." },
      { id: "backlinks-known", title: "Bekannte Backlinks", status: "info", detail: "312 verweisende Domains." },
      { id: "social", title: "Social Signals", status: "warn", detail: "Geringe Reichweite (12 Shares)." },
    ],
  },
];

function SeoCheckPage() {
  const { projectId } = useParams({ from: "/project/$projectId/seo-check" });
  const project = getProject(projectId);
  const initial = project ? `https://${project.domain}` : "";
  const [url, setUrl] = useState(initial);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [scanned] = useState(true);

  const totalChecks = SECTIONS.flatMap((s) => s.checks);
  const fails = totalChecks.filter((c) => c.status === "fail").length;
  const warns = totalChecks.filter((c) => c.status === "warn").length;
  const passes = totalChecks.filter((c) => c.status === "pass").length;
  const overall = Math.round((passes + warns * 0.5) / totalChecks.length * 100);

  return (
    <AppShell title="SEO Check" subtitle={`Analyse einer einzelnen URL · Meta, Inhalt, Struktur, Sicherheit & mehr`}>
      <div className="flex flex-col gap-6">
        {/* URL bar */}
        <Panel>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Pill>
                <Search className="size-3.5" /> {project?.domain ?? "—"}
              </Pill>
              <Pill active={device === "desktop"} onClick={() => setDevice("desktop")}>
                <Globe className="size-3.5" /> Desktop
              </Pill>
              <Pill active={device === "mobile"} onClick={() => setDevice("mobile")}>
                <Smartphone className="size-3.5" /> Mobile
              </Pill>
            </div>
            <div className="text-[11px] text-mono text-ink-subtle">Letzter Check: vor 2 Minuten</div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example.com/seite"
                className="pl-9 h-11 text-sm"
              />
            </div>
            <Button
              type="submit"
              className="h-11 gap-2 font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--signal), var(--chart-5))",
                color: "var(--background)",
              }}
            >
              <PlayCircle className="size-4" />
              Webseite checken
            </Button>
          </form>
        </Panel>

        {scanned && (
          <>
            {/* Score overview */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel title="Onpage Score" subtitle="Aggregierter SEO-Wert dieser URL">
                <div className="flex flex-col items-center gap-4">
                  <HealthRing score={overall} label="Onpage Score" />
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <Stat label="Bestanden" value={passes} color="var(--signal)" />
                    <Stat label="Warnungen" value={warns} color="var(--amber)" />
                    <Stat label="Fehler" value={fails} color="var(--rose)" />
                  </div>
                </div>
              </Panel>
              <Panel title="Bewertung pro Kategorie" subtitle="Gewichtetes Ergebnis je Bereich" className="xl:col-span-2">
                <div className="space-y-3">
                  {SECTIONS.map((s) => (
                    <ScoreBar key={s.id} label={s.title} value={s.weight} />
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="size-3.5" /> PDF exportieren
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <RefreshCcw className="size-3.5" /> Erneut prüfen
                  </Button>
                </div>
              </Panel>
            </div>

            {/* HTML Preview + Snippet */}
            <Panel title="SERP Snippet Vorschau" subtitle="So sieht Deine Seite in den Google-Ergebnissen aus">
              <div className="rounded-xl border border-border bg-surface-2 p-5 max-w-2xl">
                <div className="text-[12px] text-ink-subtle truncate">{url || "https://www.example.com"}</div>
                <div className="text-[18px] leading-snug text-[#1a0dab] font-medium mt-1">
                  {project?.name ?? "Beispiel Projekt"} — Professionelle Lösung für Dein Unternehmen
                </div>
                <div className="text-[13px] text-ink-muted mt-1">
                  Entdecke unsere maßgeschneiderten Dienstleistungen für Deine Webseite. Schnell, sicher und SEO-optimiert. Jetzt unverbindlich anfragen.
                </div>
              </div>
            </Panel>

            {/* Sections */}
            <div className="space-y-4">
              {SECTIONS.map((section) => (
                <SectionCard key={section.id} section={section} defaultOpen={section.id === "meta" || section.id === "content"} />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-2.5 text-center">
      <div className="text-display text-xl font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-mono text-ink-subtle">{label}</div>
    </div>
  );
}

function SectionCard({ section, defaultOpen }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const fails = section.checks.filter((c) => c.status === "fail").length;
  const warns = section.checks.filter((c) => c.status === "warn").length;
  const passes = section.checks.filter((c) => c.status === "pass").length;
  const tone = fails > 0 ? "fail" : warns > 0 ? "warn" : "pass";
  const toneColor = tone === "fail" ? "var(--rose)" : tone === "warn" ? "var(--amber)" : "var(--signal)";

  return (
    <section className="glass ring-aurora rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition"
      >
        <div className="size-9 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklab, ${toneColor} 14%, transparent)`, color: toneColor }}>
          {tone === "fail" ? <AlertCircle className="size-4" /> : tone === "warn" ? <AlertTriangle className="size-4" /> : <CheckCircle2 className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{section.title}</div>
          <div className="text-[11px] text-mono text-ink-subtle">
            {passes} bestanden · {warns} Warnungen · {fails} Fehler
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40 hidden sm:block">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${section.weight}%`, background: toneColor }} />
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums w-10 text-right">{section.weight}%</span>
          {open ? <ChevronDown className="size-4 text-ink-subtle" /> : <ChevronRight className="size-4 text-ink-subtle" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {section.checks.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </div>
      )}
    </section>
  );
}

function CheckRow({ check }: { check: Check }) {
  const [open, setOpen] = useState(false);
  const cfg = {
    pass: { color: "var(--signal)", Icon: CheckCircle2, label: "Bestanden" },
    warn: { color: "var(--amber)", Icon: AlertTriangle, label: "Warnung" },
    fail: { color: "var(--rose)", Icon: AlertCircle, label: "Fehler" },
    info: { color: "var(--violet)", Icon: Info, label: "Info" },
  }[check.status];
  const Icon = cfg.Icon;
  const hasEvidence = check.evidence && check.evidence.length > 0;

  return (
    <div>
      <button
        onClick={() => hasEvidence && setOpen((v) => !v)}
        className={cn(
          "w-full flex items-start gap-3 px-5 py-3 text-left transition",
          hasEvidence ? "hover:bg-muted/30 cursor-pointer" : "cursor-default",
        )}
      >
        <Icon className="size-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{check.title}</span>
            <span
              className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
              style={{ background: `color-mix(in oklab, ${cfg.color} 14%, transparent)`, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          {check.detail && <div className="text-xs text-ink-muted mt-0.5">{check.detail}</div>}
        </div>
        {hasEvidence && (
          <ArrowRight className={cn("size-3.5 text-ink-subtle mt-1 transition", open && "rotate-90")} />
        )}
      </button>
      {open && hasEvidence && (
        <div className="px-5 pb-3 pl-12">
          <ul className="text-xs text-ink-muted space-y-1">
            {check.evidence!.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-ink-subtle">›</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}