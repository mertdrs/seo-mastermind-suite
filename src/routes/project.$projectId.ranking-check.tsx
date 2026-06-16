import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill } from "@/components/app/Atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { ChevronDown, ChevronUp, Globe, Minus, PlayCircle, Smartphone, Trophy } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/ranking-check")({
  head: () => ({
    meta: [
      { title: "Ranking Check — Verity" },
      { name: "description", content: "Prüfe die Suchergebnisse für ein beliebiges Keyword." },
    ],
  }),
  component: RankingCheckPage,
});

function RankingCheckPage() {
  const { projectId } = useParams({ from: "/project/$projectId/ranking-check" });
  const project = getProject(projectId);
  const [kw, setKw] = useState("seo agentur");
  const [domain, setDomain] = useState(project?.domain ?? "");
  const [country, setCountry] = useState("DE");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [done, setDone] = useState(true);

  const yourRank = 4;
  const previous = 7;
  const change = previous - yourRank;

  const results = buildSerp(kw, domain);

  return (
    <AppShell
      title="Ranking Check"
      subtitle="Prüfe Deine Platzierung — und die Deiner Wettbewerber — für jedes Keyword."
    >
      <div className="flex flex-col gap-6">
        <Panel
          title="Rankings prüfen"
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
            <FieldLabel label="Keyword">
              <Input value={kw} onChange={(e) => setKw(e.target.value)} />
            </FieldLabel>
            <FieldLabel label="Domain (optional)">
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
            </FieldLabel>
            <FieldLabel label="Land">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="DE">Google.de</option>
                <option value="AT">Google.at</option>
                <option value="CH">Google.ch</option>
                <option value="US">Google.com</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Lokalisierung (optional)">
              <div className="flex gap-2">
                <Input placeholder="— Keine Stadt —" className="flex-1" />
                <Pill active={device === "desktop"} onClick={() => setDevice("desktop")}>
                  <Globe className="size-3.5" />
                </Pill>
                <Pill active={device === "mobile"} onClick={() => setDevice("mobile")}>
                  <Smartphone className="size-3.5" />
                </Pill>
              </div>
            </FieldLabel>
            <div className="md:col-span-2">
              <Button
                type="submit"
                className="h-11 w-full gap-2 font-semibold"
                style={{ background: "linear-gradient(135deg, var(--signal), var(--chart-5))", color: "var(--background)" }}
              >
                <PlayCircle className="size-4" /> Ranking prüfen
              </Button>
            </div>
          </form>
        </Panel>

        {done && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Panel title="Deine Position" className="lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div
                    className="size-16 rounded-2xl grid place-items-center text-display font-bold text-2xl"
                    style={{ background: "linear-gradient(135deg, var(--signal), var(--chart-5))", color: "var(--background)" }}
                  >
                    #{yourRank}
                  </div>
                  <div>
                    <DeltaBadge change={change} />
                    <div className="text-[11px] text-ink-subtle mt-1">vs. letzte Woche</div>
                  </div>
                </div>
              </Panel>
              <KPI label="Suchvolumen" value="2.400" sub="pro Monat" />
              <KPI label="Wettbewerb" value="46%" sub="mittel" />
              <KPI label="CPC" value="3.12 €" sub="Google Ads" />
            </div>

            <Panel title="Suchergebnisse" subtitle={`Top 10 für „${kw}" · ${country}`}>
              <div className="divide-y divide-border -mx-5">
                {results.map((r, i) => (
                  <div
                    key={r.url}
                    className={
                      "flex items-start gap-4 px-5 py-3 " +
                      (r.isYou ? "bg-[color:var(--signal)]/6" : "")
                    }
                  >
                    <div className="text-display text-sm font-semibold w-7 text-ink-subtle tabular-nums">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-ink-subtle text-mono truncate">{r.host}</span>
                        {r.isYou && (
                          <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded inline-flex items-center gap-1"
                            style={{ background: "color-mix(in oklab, var(--signal) 14%, transparent)", color: "var(--signal)" }}
                          >
                            <Trophy className="size-3" /> Deine Seite
                          </span>
                        )}
                      </div>
                      <div className="text-[15px] text-[#1a0dab] leading-snug truncate">{r.title}</div>
                      <div className="text-xs text-ink-muted line-clamp-2">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>
    </AppShell>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">{label}</span>
      {children}
    </label>
  );
}

function KPI({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Panel>
      <div className="text-[10px] uppercase tracking-wider text-mono text-ink-subtle">{label}</div>
      <div className="text-display text-2xl font-semibold tabular-nums mt-1">{value}</div>
      <div className="text-[11px] text-ink-subtle">{sub}</div>
    </Panel>
  );
}

function DeltaBadge({ change }: { change: number }) {
  if (change === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted">
        <Minus className="size-3" /> 0
      </span>
    );
  const up = change > 0;
  const color = up ? "var(--signal)" : "var(--rose)";
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      {up ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      {Math.abs(change)} Positionen
    </span>
  );
}

function buildSerp(kw: string, ownDomain: string) {
  const hosts = [
    "wikipedia.org",
    ownDomain || "example.com",
    "branchen-buch.de",
    ownDomain || "example.com",
    "magazin.de",
    "konkurrent-a.de",
    "konkurrent-b.de",
    "forum-online.de",
    "blog-seo.de",
    "verzeichnis.com",
  ];
  return hosts.map((h, i) => ({
    host: h,
    url: `https://${h}/${kw.replace(/\s+/g, "-")}`,
    title: `${cap(kw)} — ${["Ratgeber", "Vergleich", "Anbieter", "Tipps", "Test", "Übersicht"][i % 6]}`,
    desc: `Erfahre alles rund um ${kw}. Worauf Du achten musst und welche Anbieter es lohnen.`,
    isYou: ownDomain ? h === ownDomain && i === 3 : false,
  }));
}

function cap(s: string) {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}
