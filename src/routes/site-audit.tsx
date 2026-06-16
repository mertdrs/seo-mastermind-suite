import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/site-audit")({
  head: () => ({ meta: [{ title: "Site Audit — Verity" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell title="Site Audit" subtitle="Module in development — full implementation coming next">
      <div className="glass ring-aurora rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="size-16 rounded-2xl mb-6 grid place-items-center" style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))" }}>
          <span className="text-display text-2xl font-bold text-[color:var(--background)]">∞</span>
        </div>
        <h2 className="text-display text-2xl font-semibold mb-2">Site Audit</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          This module is part of the next build pass. Architecture, data layer and design system are already in place — wiring is next.
        </p>
      </div>
    </AppShell>
  );
}
