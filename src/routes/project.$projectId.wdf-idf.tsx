import { createFileRoute, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill } from "@/components/app/Atoms";
import { HealthRing } from "@/components/app/HealthRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { Globe, PlayCircle, Smartphone } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/wdf-idf")({
  head: () => ({
    meta: [
      { title: "WDF*IDF Tool — Verity" },
      { name: "description", content: "Textoptimierung der bestplatzierten Seiten für Dein Keyword." },
    ],
  }),
  component: WdfIdfPage,
});

function WdfIdfPage() {
  const { projectId } = useParams({ from: "/project/$projectId/wdf-idf" });
  const project = getProject(projectId);
  const [kw, setKw] = useState("christliche karten");
  const [url, setUrl] = useState(project ? `https://${project.domain}` : "");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [done, setDone] = useState(true);

  const terms = useMemo(() => buildTerms(kw), [kw]);
  const max = Math.max(...terms.map((t) => t.avg));

  return (
    <AppShell
      title="WDF*IDF Tool"
      subtitle="Welche Begriffe verwenden die Top-Seiten — und welche fehlen Dir noch?"
    >
      <div className="flex flex-col gap-6">
        <Panel
          title="Textoptimierung prüfen"
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
            <FieldLabel label="URL / Webseite (optional)">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/seite" />
            </FieldLabel>
            <FieldLabel label="Land">
              <select className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option>Google.de</option>
                <option>Google.at</option>
                <option>Google.com</option>
              </select>
            </FieldLabel>
            <FieldLabel label="Gerät / Stadt (optional)">
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
                <PlayCircle className="size-4" /> WDF*IDF prüfen
              </Button>
            </div>
          </form>
        </Panel>

        {done && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel title="Optimization Score" subtitle={`Für „${kw}"`}>
                <div className="flex flex-col items-center gap-3">
                  <HealthRing score={67} label="WDF*IDF" />
                  <div className="text-xs text-ink-muted text-center max-w-xs">
                    Mittlere Optimierung. Ergänze die markierten Begriffe um in der Top-3 mitspielen zu können.
                  </div>
                </div>
              </Panel>
              <Panel title="Wichtigste Begriffe" subtitle="Häufig genutzt von Top-Seiten" className="xl:col-span-2">
                <div className="flex flex-wrap gap-1.5">
                  {terms.slice(0, 24).map((t) => (
                    <span
                      key={t.term}
                      className="text-xs font-medium px-2 py-1 rounded-full border"
                      style={{
                        background: t.onYou
                          ? "color-mix(in oklab, var(--signal) 12%, transparent)"
                          : "color-mix(in oklab, var(--rose) 10%, transparent)",
                        color: t.onYou ? "var(--signal)" : "var(--rose)",
                        borderColor: "transparent",
                        fontSize: 11 + Math.min(8, Math.round((t.avg / max) * 8)) + "px",
                      }}
                      title={`${t.term} · WDF*IDF Ø ${t.avg.toFixed(2)}`}
                    >
                      {t.term}
                    </span>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="Gewichtete Begriffe" subtitle="Durchschnittlicher WDF*IDF-Wert über die Top-10 Ergebnisse">
              <div className="space-y-2">
                {terms.map((t) => (
                  <div key={t.term} className="grid grid-cols-[160px_1fr_44px] items-center gap-3 text-sm">
                    <span className={"truncate " + (t.onYou ? "text-foreground" : "text-ink-muted")}>{t.term}</span>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(t.avg / max) * 100}%`,
                          background: t.onYou
                            ? "linear-gradient(90deg, var(--signal), var(--chart-5))"
                            : "var(--rose)",
                        }}
                      />
                    </div>
                    <span className="text-xs text-mono text-ink-subtle text-right tabular-nums">{t.avg.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "var(--signal)" }} /> in Deinem Text
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: "var(--rose)" }} /> fehlt
                </span>
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

function buildTerms(seed: string) {
  const dict = [
    seed,
    "postkarte",
    "karten",
    "bibelverse",
    "geschenk",
    "design",
    "shop",
    "online kaufen",
    "illustrationen",
    "qualität",
    "christlich",
    "spruch",
    "freude",
    "glaube",
    "set",
    "papier",
    "klappkarten",
    "geburtstag",
    "ostern",
    "weihnachten",
    "versand",
    "geschenkidee",
    "motiv",
    "kunst",
  ];
  let h = 7;
  return dict.map((d, i) => {
    h = (h * 31 + d.charCodeAt(0) + i) | 0;
    const avg = 0.6 + Math.abs((h % 90)) / 25;
    return { term: d, avg, onYou: i % 3 !== 1 };
  });
}
