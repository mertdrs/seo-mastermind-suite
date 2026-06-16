import { Bell, Calendar, Globe, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-20 glass border-b border-border">
      <div className="flex items-center justify-between gap-4 px-6 lg:px-8 h-16">
        <div className="min-w-0 flex-1">
          <h1 className="text-display text-lg font-semibold truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="text-mono text-xs gap-1.5">
            <Globe className="size-3.5" /> Germany
          </Button>
          <Button variant="ghost" size="sm" className="text-mono text-xs gap-1.5">
            <Calendar className="size-3.5" /> Last 30 days
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="size-9">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5">
            <Download className="size-3.5" /> Export
          </Button>
          <Button
            size="sm"
            className="text-xs gap-1.5 font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))",
              color: "var(--background)",
              boxShadow: "0 0 20px -4px color-mix(in oklab, var(--aurora-cyan) 60%, transparent)",
            }}
          >
            <Sparkles className="size-3.5" /> AI Summary
          </Button>
        </div>
      </div>
    </header>
  );
}