import { createFileRoute, useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill } from "@/components/app/Atoms";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { ArrowUpRight, CheckCircle2, Copy, Globe, Smartphone } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/serp-snippet")({
  head: () => ({
    meta: [
      { title: "SERP Snippet Generator — Verity" },
      { name: "description", content: "Vorschau, wie Deine Seite in Google erscheint." },
    ],
  }),
  component: SerpSnippetPage,
});

function SerpSnippetPage() {
  const { projectId } = useParams({ from: "/project/$projectId/serp-snippet" });
  const project = getProject(projectId);
  const [url, setUrl] = useState(project ? `https://${project.domain}/leistungen` : "");
  const [title, setTitle] = useState("Verity — SEO & AI Visibility Suite für moderne Marken");
  const [desc, setDesc] = useState(
    "Bringe Deine Seiten in die Top-Rankings — bei Google und in den neuen KI-Antworten. Tracking, Audits & Optimierung in einem Tool.",
  );
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState<"title" | "desc" | null>(null);

  const titleLen = title.length;
  const descLen = desc.length;
  // Pixel-Schätzung: ~7px pro Zeichen Title (Arial Bold 18px), ~6px Description.
  const titlePx = useMemo(() => Math.round(title.length * 7.1), [title]);
  const descPx = useMemo(() => Math.round(desc.length * 6.2), [desc]);
  const titleMaxPx = device === "mobile" ? 480 : 580;
  const descMaxPx = device === "mobile" ? 760 : 920;
  const titleTone = titlePx > titleMaxPx ? "warn" : titleLen < 30 ? "fail" : "pass";
  const descTone = descPx > descMaxPx ? "warn" : descLen < 80 ? "fail" : "pass";

  function copy(kind: "title" | "desc") {
    navigator.clipboard?.writeText(kind === "title" ? title : desc);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <AppShell title="SERP Snippet Generator" subtitle="Optimiere Title und Description und sieh die Google-Vorschau live.">
      <div className="flex flex-col gap-6 max-w-5xl">
        <Panel
          title="Snippet bearbeiten"
          action={
            <div className="flex gap-2">
              <Pill active={device === "desktop"} onClick={() => setDevice("desktop")}>
                <Globe className="size-3.5" /> Desktop
              </Pill>
              <Pill active={device === "mobile"} onClick={() => setDevice("mobile")}>
                <Smartphone className="size-3.5" /> Mobile
              </Pill>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-3">
            <FieldLabel label="URL">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
            </FieldLabel>
            <FieldLabel
              label={`Title · ${titleLen} Zeichen · ~${titlePx}px (Limit ${titleMaxPx}px)`}
              action={
                <button type="button" onClick={() => copy("title")} className="text-[11px] inline-flex items-center gap-1 text-ink-subtle hover:text-foreground">
                  {copied === "title" ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
                  {copied === "title" ? "Kopiert" : "Kopieren"}
                </button>
              }
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
              <Counter value={titlePx} max={titleMaxPx} tone={titleTone} />
            </FieldLabel>
            <FieldLabel
              label={`Description · ${descLen} Zeichen · ~${descPx}px (Limit ${descMaxPx}px)`}
              action={
                <button type="button" onClick={() => copy("desc")} className="text-[11px] inline-flex items-center gap-1 text-ink-subtle hover:text-foreground">
                  {copied === "desc" ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
                  {copied === "desc" ? "Kopiert" : "Kopieren"}
                </button>
              }
            >
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <Counter value={descPx} max={descMaxPx} tone={descTone} />
            </FieldLabel>
          </div>
        </Panel>

        <Panel title="Live-Vorschau" subtitle="So sieht Deine Seite in den Google-Ergebnissen aus">
          <div
            className={
              "rounded-xl border border-border bg-surface-2 p-5 " + (device === "mobile" ? "max-w-sm" : "max-w-2xl")
            }
          >
            <div className="text-[12px] text-ink-subtle truncate">{url || "https://example.com"}</div>
            <div className="text-[18px] leading-snug text-[#1a0dab] font-medium mt-1 line-clamp-2">{title}</div>
            <div className="text-[13px] text-ink-muted mt-1 line-clamp-3">{desc}</div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Link to="/project/$projectId/seo-check" params={{ projectId }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 hover:bg-muted/60">
              Vollen SEO Check ausführen <ArrowUpRight className="size-3.5" />
            </Link>
            <Link to="/project/$projectId/site-audit" params={{ projectId }} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 hover:bg-muted/60">
              Im Site Audit verfolgen <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function FieldLabel({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-mono text-ink-subtle truncate">{label}</span>
        {action}
      </span>
      {children}
    </label>
  );
}

function Counter({ value, max, tone }: { value: number; max: number; tone: "pass" | "warn" | "fail" }) {
  const color = tone === "pass" ? "var(--status-success)" : tone === "warn" ? "var(--status-warning)" : "var(--status-danger)";
  return (
    <div className="h-1 rounded-full bg-muted overflow-hidden">
      <div className="h-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  );
}
