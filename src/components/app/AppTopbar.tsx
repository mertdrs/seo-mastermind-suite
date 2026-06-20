import { Bell, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScopeBar } from "./ScopeBar";

export function AppTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 glass border-b border-border">
      <div className="flex items-center justify-between gap-4 px-6 lg:px-8 h-16">
        <div className="min-w-0 flex-1">
          <h1 className="text-display text-lg font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <ScopeBar />
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="size-9" aria-label="Benachrichtigungen">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" aria-label="Export">
            <Download className="size-3.5" /> Export
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1.5 font-semibold"
            style={{
              background: "var(--ai-accent)",
              color: "var(--brand-foreground)",
            }}
            aria-label="KI-Zusammenfassung"
          >
            <Sparkles className="size-3.5" /> KI-Zusammenfassung
          </Button>
        </div>
      </div>
    </header>
  );
}