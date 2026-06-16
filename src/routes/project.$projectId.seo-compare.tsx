import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Panel } from "@/components/app/Atoms";
import { Wrench } from "lucide-react";

const TITLE = "seo-compare";

export const Route = createFileRoute("/project/$projectId/seo-compare")({
  head: () => ({ meta: [{ title: TITLE + " — Verity" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title={TITLE.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())} subtitle="Onpage-Analyse-Tool · in Vorbereitung">
      <Panel>
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="size-12 rounded-2xl grid place-items-center bg-[color:var(--signal)]/12 text-[color:var(--signal-foreground)]">
            <Wrench className="size-5" />
          </div>
          <h2 className="text-display text-lg font-semibold">Bald verfügbar</h2>
          <p className="text-sm text-ink-muted max-w-md">
            Dieses Modul wird gerade aufgebaut. Die Auswertung wird Daten aus dem aktuellen Projekt nutzen.
          </p>
        </div>
      </Panel>
    </AppShell>
  );
}
