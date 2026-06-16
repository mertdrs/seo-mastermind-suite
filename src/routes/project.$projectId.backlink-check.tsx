import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill } from "@/components/app/Atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { Download, ExternalLink, PlayCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/project/$projectId/backlink-check")({
  head: () => ({
    meta: [
      { title: "Backlink Check — Verity" },
      { name: "description", content: "Analysiere Dein Backlink-Profil und entdecke neue Linkbuilding-Möglichkeiten." },
    ],
  }),
  component: BacklinkCheckPage,
});

function BacklinkCheckPage() {
  const { projectId } = useParams({ from: "/project/$projectId/backlink-check" });
  const project = getProject(projectId);
  const [target, setTarget] = useState(project?.domain ?? "");
  const [mode, setMode] = useState<"url" | "domain">("domain");
  const [done, setDone] = useState(true);

  const total = 330;
  const follow = Math.round(total * 0.95);
  const nofollow = total - follow;
  const refDomains = 24;
  const rating = 23;

  const pieData = [
    { name: "Follow", value: follow, color: "var(--signal)" },
    { name: "Nofollow", value: nofollow, color: "var(--violet)" },
  ];

  const links = buildLinks(target);

  return (
    <AppShell
      title="Backlink Check"
      subtitle="Erhalte Einblick in das Backlink-Profil einer URL oder Domain."
    >
      <div className="flex flex-col gap-6">
        <Panel
          title="Backlinks prüfen"
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
            className="flex flex-col gap-3"
          >
            <FieldLabel label="Domain oder URL">
              <div className="flex gap-2">
                <Input
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="example.com"
                  className="flex-1"
                />
                <Pill active={mode === "url"} onClick={() => setMode("url")}>URL</Pill>
                <Pill active={mode === "domain"} onClick={() => setMode("domain")}>Domain</Pill>
              </div>
            </FieldLabel>
            <Button
              type="submit"
              className="h-11 w-full gap-2 font-semibold"
              style={{ background: "linear-gradient(135deg, var(--signal), var(--chart-5))", color: "var(--background)" }}
            >
              <PlayCircle className="size-4" /> Backlinks prüfen
            </Button>
          </form>
        </Panel>

        {done && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Panel>
                <Lbl>Backlinks gesamt</Lbl>
                <Big>{total}</Big>
                <Sub>aus {refDomains} Domains</Sub>
              </Panel>
              <Panel>
                <Lbl>Verweisende Domains</Lbl>
                <Big>{refDomains}</Big>
                <Sub>davon 18 thematisch</Sub>
              </Panel>
              <Panel>
                <Lbl>Domain Rating</Lbl>
                <Big>{rating}</Big>
                <Sub>Authority Score</Sub>
              </Panel>
              <Panel title="Follow vs Nofollow">
                <div className="h-[110px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={2}>
                        {pieData.map((p) => (
                          <Cell key={p.name} fill={p.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-3 text-[11px] text-ink-subtle -mt-2">
                  <span><span className="inline-block size-2 rounded-full mr-1" style={{ background: "var(--signal)" }} />Follow {follow}</span>
                  <span><span className="inline-block size-2 rounded-full mr-1" style={{ background: "var(--violet)" }} />Nofollow {nofollow}</span>
                </div>
              </Panel>
            </div>

            <Panel
              title="Verweisende Links"
              subtitle="Detaillierte Liste aller Quellen"
              action={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="size-3.5" /> Export
                </Button>
              }
            >
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle border-y border-border">
                      <th className="text-left font-medium px-3 py-2.5 w-16">Rating</th>
                      <th className="text-left font-medium px-3 py-2.5">Quelle</th>
                      <th className="text-left font-medium px-3 py-2.5">Ziel-URL</th>
                      <th className="text-left font-medium px-3 py-2.5 w-24">Typ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {links.map((l) => (
                      <tr key={l.from + l.to} className="hover:bg-muted/30">
                        <td className="px-3 py-2.5">
                          <RatingBar value={l.rating} />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-sm">{l.title}</div>
                          <a
                            href={l.from}
                            className="text-[11px] text-mono text-ink-subtle inline-flex items-center gap-1 hover:text-foreground"
                          >
                            {l.from} <ExternalLink className="size-3" />
                          </a>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-mono text-ink-muted truncate max-w-xs">{l.to}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
                            style={{
                              background: `color-mix(in oklab, ${l.follow ? "var(--signal)" : "var(--violet)"} 14%, transparent)`,
                              color: l.follow ? "var(--signal)" : "var(--violet)",
                            }}
                          >
                            {l.follow ? "Follow" : "Nofollow"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
function Lbl({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-wider text-mono text-ink-subtle">{children}</div>;
}
function Big({ children }: { children: React.ReactNode }) {
  return <div className="text-display text-3xl font-semibold tabular-nums mt-1">{children}</div>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-ink-subtle">{children}</div>;
}
function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full" style={{ width: `${value}%`, background: "linear-gradient(90deg, var(--signal), var(--chart-5))" }} />
      </div>
      <span className="text-[11px] text-mono tabular-nums text-ink-muted">{value}</span>
    </div>
  );
}

function buildLinks(domain: string) {
  const target = domain || "example.com";
  const rows = [
    { host: "oeab.de", title: "Produkte zu Jahreslosung & Bibelleseplan", path: "produkte" },
    { host: "oeab.de", title: "Produkte zu Jahreslosung — Ökumenische AG", path: "produkte" },
    { host: "oeab.de", title: "Karten und Postkarten", path: "karten" },
    { host: "blog-glaube.de", title: "Geschenkideen mit Bibelvers", path: "geschenkideen" },
    { host: "magazin-spirit.de", title: "Schöne christliche Karten 2026", path: "karten-2026" },
    { host: "verzeichnis-shop.de", title: "Online-Shops Christliche Produkte", path: "shops" },
  ];
  return rows.map((r, i) => ({
    from: `https://www.${r.host}/index.php?id=${i}`,
    to: `https://${target}/karten`,
    title: r.title,
    rating: 42 + ((i * 13) % 50),
    follow: i !== 2,
  }));
}
