import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, ScoreBar } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { Crown, Download, PlayCircle, Settings2, Trophy } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/seo-compare")({
  head: () => ({
    meta: [
      { title: "SEO Compare — Verity" },
      { name: "description", content: "Vergleiche die Keyword-Optimierung zweier Seiten." },
    ],
  }),
  component: SeoComparePage,
});

const CATEGORIES = [
  { key: "meta", label: "Meta-Information" },
  { key: "html", label: "HTML-Optimierung" },
  { key: "content", label: "Seitenqualität" },
  { key: "links", label: "Verlinkung" },
  { key: "perf", label: "Performance" },
] as const;

function SeoComparePage() {
  const { projectId } = useParams({ from: "/project/$projectId/seo-compare" });
  const project = getProject(projectId);
  const [a, setA] = useState(project ? `https://${project.domain}/leistungen` : "");
  const [b, setB] = useState("https://wettbewerber.de/leistungen");
  const [kw, setKw] = useState("seo agentur");
  const [done, setDone] = useState(true);

  const A = { score: 78, meta: 92, html: 64, content: 80, links: 70, perf: 88, host: hostOf(a) };
  const B = { score: 81, meta: 88, html: 72, content: 90, links: 76, perf: 84, host: hostOf(b) };
  const winner: "A" | "B" = A.score >= B.score ? "A" : "B";

  return (
    <AppShell title="SEO Compare" subtitle="Vergleiche die SEO-Optimierung zweier Seiten Seite an Seite.">
      <div className="flex flex-col gap-6">
        <Panel
          title="Seiten vergleichen"
          action={
            <span className="text-xs text-ink-subtle">
              Noch <strong className="text-foreground">3</strong> von 5 Checks heute möglich
            </span>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <FieldLabel label="Page URL · A">
              <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="https://webpage-a.com/landingpage" />
            </FieldLabel>
            <FieldLabel label="Page URL · B">
              <Input value={b} onChange={(e) => setB(e.target.value)} placeholder="https://webpage-b.com/landingpage" />
            </FieldLabel>
            <FieldLabel label="Keyword(s)" className="md:col-span-2">
              <Input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="z. B. seo agentur" />
            </FieldLabel>
            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                className="h-11 flex-1 gap-2 font-semibold"
                style={{ background: "linear-gradient(135deg, var(--signal), var(--chart-5))", color: "var(--background)" }}
              >
                <PlayCircle className="size-4" /> Seiten vergleichen
              </Button>
              <Button type="button" variant="outline" size="icon" className="h-11 w-11">
                <Settings2 className="size-4" />
              </Button>
            </div>
          </form>
        </Panel>

        {done && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CompareCard host={A.host} score={A.score} isWinner={winner === "A"} side="A" />
              <CompareCard host={B.host} score={B.score} isWinner={winner === "B"} side="B" />
            </div>

            <Panel
              title="Direktvergleich pro Bereich"
              action={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="size-3.5" /> Exportieren
                </Button>
              }
            >
              <div className="space-y-4">
                {CATEGORIES.map((c) => {
                  const vA = (A as any)[c.key] as number;
                  const vB = (B as any)[c.key] as number;
                  return (
                    <div key={c.key}>
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-mono text-ink-subtle mb-1.5">
                        <span>{c.label}</span>
                        <span className="tabular-nums">
                          A {vA}% · B {vB}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <ScoreBar label="A" value={vA} />
                        <ScoreBar label="B" value={vB} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </>
        )}
      </div>
    </AppShell>
  );
}

function FieldLabel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={"flex flex-col gap-1.5 " + (className ?? "")}>
      <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">{label}</span>
      {children}
    </label>
  );
}

function CompareCard({ host, score, isWinner, side }: { host: string; score: number; isWinner: boolean; side: "A" | "B" }) {
  return (
    <Panel
      title={`Seite ${side}`}
      subtitle={host}
      badge={isWinner ? "GEWINNER" : undefined}
      className={isWinner ? "ring-2 ring-[color:var(--signal)]/40" : undefined}
    >
      <div className="flex items-center gap-5">
        <HealthRing score={score} size={140} label={isWinner ? "Top" : "Vergleich"} />
        <div className="flex-1 space-y-2 text-sm">
          <Row label="Status" value="200 OK" />
          <Row label="Wörter" value={isWinner ? "812" : "640"} />
          <Row label="Title-Länge" value={isWinner ? "58" : "72"} />
          <Row label="H1" value={isWinner ? "1" : "0"} />
        </div>
      </div>
      {isWinner && (
        <div className="mt-4 flex items-center gap-2 text-xs text-[color:var(--signal-foreground)]">
          <Trophy className="size-3.5" /> Stärker bei Inhalt & strukturierten Daten.
        </div>
      )}
      {!isWinner && (
        <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
          <Crown className="size-3.5" /> Vorteil bei Meta-Tags & technischen Kennwerten.
        </div>
      )}
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
      <span className="text-ink-muted text-xs">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function hostOf(u: string) {
  try {
    return new URL(u).host;
  } catch {
    return u || "—";
  }
}
