import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Panel } from "@/components/app/Atoms";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  FileSearch,
  GaugeCircle,
  Globe,
  Link2,
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/project/$projectId/tools")({
  head: () => ({
    meta: [
      { title: "Free SEO Tools — Verity" },
      { name: "description", content: "Schnelle Einzel-Checks: SEO Check, WDF*IDF, SERP Snippet, Ranking Check und mehr." },
    ],
  }),
  component: Page,
});

type Tool = {
  to: string;
  label: string;
  icon: typeof Activity;
  desc: string;
  cta: string;
  next?: { to: string; label: string };
};

const GROUPS: { id: string; title: string; subtitle: string; color: string; tools: Tool[] }[] = [
  {
    id: "page",
    title: "Seiten-Analyse",
    subtitle: "Eine einzelne URL prüfen, optimieren oder vergleichen.",
    color: "var(--series-1)",
    tools: [
      { to: "/project/$projectId/seo-check", label: "SEO Check", icon: GaugeCircle, desc: "Onpage-Analyse einer URL: Meta, Inhalt, Server, Quick-Wins.", cta: "URL prüfen", next: { to: "/project/$projectId/site-audit", label: "Im Site Audit fortsetzen" } },
      { to: "/project/$projectId/seo-compare", label: "SEO Compare", icon: FileSearch, desc: "Zwei URLs direkt nebeneinander vergleichen.", cta: "URLs vergleichen" },
      { to: "/project/$projectId/serp-snippet", label: "SERP Snippet", icon: Globe, desc: "Title & Description live in der Google-Vorschau bauen.", cta: "Snippet bauen", next: { to: "/project/$projectId/seo-check", label: "Vollen SEO Check ausführen" } },
    ],
  },
  {
    id: "keyword",
    title: "Keyword-Tools",
    subtitle: "Keywords finden, bewerten und Texte ausrichten.",
    color: "var(--series-2)",
    tools: [
      { to: "/project/$projectId/keyword-check", label: "Keyword Check", icon: Target, desc: "Wie gut ist eine Seite für ein konkretes Keyword optimiert?", cta: "Keyword prüfen", next: { to: "/project/$projectId/rank-tracker", label: "Keyword tracken" } },
      { to: "/project/$projectId/keyword-recherche", label: "Keyword Recherche", icon: ListChecks, desc: "Schneller Einstieg: Related, Fragen, URL- und Wettbewerber-Quellen.", cta: "Ideen finden", next: { to: "/project/$projectId/keywords", label: "Im Explorer vertiefen" } },
      { to: "/project/$projectId/wdf-idf", label: "WDF·IDF", icon: BarChart3, desc: "Termgewichtung gegen Top-10-Durchschnitt.", cta: "Text analysieren", next: { to: "/project/$projectId/content", label: "Content-Plan öffnen" } },
    ],
  },
  {
    id: "off",
    title: "Off-Page & Wettbewerb",
    subtitle: "Rankings, Backlinks und SERP-Kontext.",
    color: "var(--series-3)",
    tools: [
      { to: "/project/$projectId/ranking-check", label: "Ranking Check", icon: Activity, desc: "SERP-Simulation: Deine Domain vs. Wettbewerber für ein Keyword.", cta: "Ranking prüfen", next: { to: "/project/$projectId/rank-tracker", label: "Dauerhaft tracken" } },
      { to: "/project/$projectId/backlink-check", label: "Backlink Check", icon: Link2, desc: "Linkprofil einer Domain auf einen Blick.", cta: "Linkprofil ansehen", next: { to: "/project/$projectId/backlinks", label: "Vollständige Backlinks öffnen" } },
    ],
  },
];

function Page() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };

  return (
    <AppShell title="Free SEO Tools" subtitle="Schnelle, fokussierte Einzel-Checks — als Einstieg in die großen Module.">
      <div className="flex flex-col gap-6">
        {/* Hero: typische Workflows */}
        <Panel title="Beliebte Workflows" subtitle="In zwei Schritten vom Quick-Check zum dauerhaften Monitoring.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <WorkflowCard
              projectId={projectId}
              icon={Sparkles}
              title="Quick-Wins für eine URL"
              steps={[
                { to: "/project/$projectId/seo-check", label: "SEO Check" },
                { to: "/project/$projectId/site-audit", label: "Site Audit" },
              ]}
            />
            <WorkflowCard
              projectId={projectId}
              icon={Target}
              title="Neues Keyword evaluieren"
              steps={[
                { to: "/project/$projectId/keyword-check", label: "Keyword Check" },
                { to: "/project/$projectId/rank-tracker", label: "Rank Tracker" },
              ]}
            />
            <WorkflowCard
              projectId={projectId}
              icon={TrendingUp}
              title="Wettbewerber einordnen"
              steps={[
                { to: "/project/$projectId/ranking-check", label: "Ranking Check" },
                { to: "/project/$projectId/competitors", label: "Competitors" },
              ]}
            />
          </div>
        </Panel>

        {GROUPS.map((g) => (
          <section key={g.id} className="flex flex-col gap-3">
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full shrink-0" style={{ background: g.color }} />
                  <h2 className="text-display text-base font-semibold truncate">{g.title}</h2>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{g.subtitle}</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-subtle shrink-0">{g.tools.length} Tools</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {g.tools.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.to} className="group relative glass ring-aurora rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ boxShadow: `inset 3px 0 0 ${g.color}` }}>
                    <div className="flex items-start gap-3">
                      <div
                        className="size-10 rounded-xl grid place-items-center shrink-0"
                        style={{ background: `color-mix(in oklab, ${g.color} 14%, transparent)`, color: g.color }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-display font-semibold text-sm truncate">{t.label}</h3>
                        <p className="mt-1 text-xs text-ink-muted leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                      <Link
                        to={t.to}
                        params={{ projectId }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:opacity-80"
                      >
                        {t.cta} <ArrowUpRight className="size-3.5" />
                      </Link>
                      {t.next && (
                        <Link
                          to={t.next.to}
                          params={{ projectId }}
                          className="text-[11px] text-ink-subtle hover:text-foreground truncate"
                          title={t.next.label}
                        >
                          → {t.next.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}

function WorkflowCard({
  projectId,
  icon: Icon,
  title,
  steps,
}: {
  projectId: string;
  icon: typeof Activity;
  title: string;
  steps: { to: string; label: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--status-info-bg)", color: "var(--status-info)" }}>
          <Icon className="size-4" />
        </div>
        <span className="text-sm font-semibold truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {steps.map((s, i) => (
          <span key={s.to} className="inline-flex items-center gap-1.5">
            <Link
              to={s.to}
              params={{ projectId }}
              className="text-[11px] font-medium rounded-lg border border-border bg-background px-2.5 py-1 hover:bg-muted/60"
            >
              {i + 1}. {s.label}
            </Link>
            {i < steps.length - 1 && <ArrowUpRight className="size-3 text-ink-subtle" />}
          </span>
        ))}
      </div>
    </div>
  );
}
