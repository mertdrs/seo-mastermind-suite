import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Panel, Pill } from "@/components/app/Atoms";
import { Input } from "@/components/ui/input";
import { getProject } from "@/lib/project-store";
import { Globe, Smartphone } from "lucide-react";

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

  const titleLen = title.length;
  const descLen = desc.length;
  const titleTone = titleLen <= 30 ? "fail" : titleLen <= 60 ? "pass" : "warn";
  const descTone = descLen <= 80 ? "fail" : descLen <= 160 ? "pass" : "warn";

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
            <FieldLabel label={`Title · ${titleLen} Zeichen`}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
              <Counter value={titleLen} max={60} tone={titleTone} />
            </FieldLabel>
            <FieldLabel label={`Description · ${descLen} Zeichen`}>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <Counter value={descLen} max={160} tone={descTone} />
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
        </Panel>
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

function Counter({ value, max, tone }: { value: number; max: number; tone: "pass" | "warn" | "fail" }) {
  const color = tone === "pass" ? "var(--signal)" : tone === "warn" ? "var(--amber)" : "var(--rose)";
  return (
    <div className="h-1 rounded-full bg-muted overflow-hidden">
      <div className="h-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  );
}
