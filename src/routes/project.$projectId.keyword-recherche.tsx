import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill, KdBar } from "@/components/app/Atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, PlayCircle, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/keyword-recherche")({
  head: () => ({
    meta: [
      { title: "Keyword Recherche — Verity" },
      {
        name: "description",
        content: "Entdecke schnell und einfach relevante Keywords für Deine Website.",
      },
    ],
  }),
  component: KeywordResearchPage,
});

type Mode = "related" | "url" | "compete";
const INTENTS = ["Info", "Trans", "Komm", "Nav"] as const;

function KeywordResearchPage() {
  const [mode, setMode] = useState<Mode>("related");
  const [seed, setSeed] = useState("seo agentur");
  const [country, setCountry] = useState("DE");
  const [scanned, setScanned] = useState(true);

  const rows = useMemo(() => buildRows(seed), [seed]);

  return (
    <AppShell
      title="Keyword Recherche"
      subtitle="Entdecke schnell und einfach relevante Keywords mit Volumen, Intent & CPC."
    >
      <div className="flex flex-col gap-6">
        <Panel
          title="Entdecke relevante Keywords"
          action={
            <span className="text-xs text-ink-subtle">
              Noch <strong className="text-foreground">3</strong> von 5 Checks heute möglich
            </span>
          }
        >
          <div className="flex gap-2 mb-4">
            <ModeTab active={mode === "related"} onClick={() => setMode("related")} label="Ähnliche Keywords" />
            <ModeTab active={mode === "url"} onClick={() => setMode("url")} label="URL / Domain" />
            <ModeTab active={mode === "compete"} onClick={() => setMode("compete")} label="Wettbewerbsanalyse" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setScanned(true);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {mode === "related" && (
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Keyword</span>
                <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="z. B. seo agentur" />
              </label>
            )}
            {mode === "url" && (
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">URL / Domain</span>
                <Input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="https://example.com/seite" />
              </label>
            )}
            {mode === "compete" && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Deine Domain</span>
                  <Input placeholder="deine-domain.de" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Wettbewerber</span>
                  <Input placeholder="wettbewerber.de" />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Land</span>
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
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle">Analyse</span>
              <select className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option>Ähnliche Keywords</option>
                <option>People also ask</option>
                <option>Auto-Complete</option>
              </select>
            </label>

            <div className="md:col-span-2">
              <Button
                type="submit"
                className="h-11 w-full gap-2 font-semibold"
                style={{
                  background: "linear-gradient(135deg, var(--signal), var(--chart-5))",
                  color: "var(--background)",
                }}
              >
                <PlayCircle className="size-4" /> Keyword Recherche starten
              </Button>
            </div>
          </form>
        </Panel>

        {scanned && (
          <Panel
            title={`${rows.length} Keyword-Ideen`}
            subtitle={`Bezug: „${seed}" · ${country}`}
            action={
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="size-3.5" /> Export CSV
              </Button>
            }
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <Input placeholder="Filter…" className="h-9 pl-9 text-sm" />
              </div>
              {INTENTS.map((i) => (
                <Pill key={i}>{i}</Pill>
              ))}
            </div>

            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle border-y border-border">
                    <th className="text-left font-medium px-5 py-2.5">Keyword</th>
                    <th className="text-right font-medium px-3 py-2.5">Volumen</th>
                    <th className="text-left font-medium px-3 py-2.5">Intent</th>
                    <th className="text-left font-medium px-3 py-2.5 w-44">Wettbewerb</th>
                    <th className="text-right font-medium px-3 py-2.5">CPC</th>
                    <th className="px-5 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.kw} className="hover:bg-muted/30">
                      <td className="px-5 py-2.5 font-medium">{r.kw}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.vol.toLocaleString("de-DE")}</td>
                      <td className="px-3 py-2.5">
                        <IntentBadge i={r.intent} />
                      </td>
                      <td className="px-3 py-2.5">
                        <KdBar value={r.kd} />
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-mono">{r.cpc.toFixed(2)} €</td>
                      <td className="px-5 py-2.5 text-right">
                        <Button size="icon" variant="ghost" className="size-7">
                          <Plus className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 h-10 rounded-lg border text-sm font-medium transition " +
        (active
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-surface-2 hover:bg-muted/70")
      }
    >
      {label}
    </button>
  );
}

function IntentBadge({ i }: { i: string }) {
  const color =
    i === "Trans"
      ? "var(--signal)"
      : i === "Komm"
      ? "var(--amber)"
      : i === "Nav"
      ? "var(--violet)"
      : "var(--chart-5)";
  return (
    <span
      className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
      style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
    >
      {i}
    </span>
  );
}

function buildRows(seed: string) {
  const base = seed || "keyword";
  const variants = [
    base,
    `${base} berlin`,
    `${base} preise`,
    `beste ${base}`,
    `${base} vergleich`,
    `kleine ${base}`,
    `${base} test`,
    `${base} für kmu`,
    `${base} agentur kosten`,
    `lokale ${base}`,
    `${base} 2026`,
    `${base} hamburg`,
  ];
  return variants.map((kw, idx) => {
    const seedNum = hash(kw);
    return {
      kw,
      vol: 80 + ((seedNum * 13) % 9800),
      intent: INTENTS[seedNum % INTENTS.length],
      kd: 8 + ((seedNum * 7) % 84),
      cpc: 0.4 + ((seedNum * 3) % 60) / 10,
      idx,
    };
  });
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
