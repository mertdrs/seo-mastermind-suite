import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import {
  Activity,
  BarChart3,
  FileSearch,
  GaugeCircle,
  Globe,
  Link2,
  ListChecks,
  Target,
  ArrowUpRight,
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

const TOOLS = [
  { to: "/project/$projectId/seo-check", label: "SEO Check", icon: GaugeCircle, desc: "Onpage-Analyse einer einzelnen URL: Meta, Inhalt, Server, Quick-Wins." },
  { to: "/project/$projectId/keyword-check", label: "Keyword Check", icon: Target, desc: "Wie gut ist eine Seite für ein konkretes Keyword optimiert?" },
  { to: "/project/$projectId/keyword-recherche", label: "Keyword Recherche", icon: ListChecks, desc: "Schneller Einstieg: Related, Fragen, URL- und Wettbewerber-Quellen." },
  { to: "/project/$projectId/seo-compare", label: "SEO Compare", icon: FileSearch, desc: "Zwei URLs direkt nebeneinander vergleichen." },
  { to: "/project/$projectId/ranking-check", label: "Ranking Check", icon: Activity, desc: "SERP-Simulation: Deine Domain vs. Wettbewerber für ein Keyword." },
  { to: "/project/$projectId/wdf-idf", label: "WDF·IDF Tool", icon: BarChart3, desc: "Termgewichtung gegen Top-10-Durchschnitt." },
  { to: "/project/$projectId/backlink-check", label: "Backlink Check", icon: Link2, desc: "Linkprofil einer Domain auf einen Blick." },
  { to: "/project/$projectId/serp-snippet", label: "SERP Snippet Generator", icon: Globe, desc: "Title & Meta Description live in der Google-Vorschau bauen." },
] as const;

function Page() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  return (
    <AppShell title="Free SEO Tools" subtitle="Schnelle, fokussierte Einzel-Checks — ergänzend zu den großen Modulen.">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              params={{ projectId }}
              className="group relative glass ring-aurora rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div
                  className="size-10 rounded-xl grid place-items-center shrink-0"
                  style={{ background: "var(--status-info-bg)", color: "var(--status-info)" }}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-display font-semibold text-sm">{t.label}</h3>
                    <ArrowUpRight className="size-4 text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted leading-relaxed">{t.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
