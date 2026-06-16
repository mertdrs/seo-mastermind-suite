import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { LayoutDashboard, Palette, Settings, Sparkles, FileBarChart } from "lucide-react";
import { useProjects } from "@/lib/project-store";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const projects = useProjects();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Projekte, Module oder Aktionen suchen…" />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse.</CommandEmpty>
        <CommandGroup heading="Workspace">
          <CommandItem onSelect={() => { onOpenChange(false); navigate({ to: "/dashboard" }); }}>
            <LayoutDashboard className="size-4" /> <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); navigate({ to: "/brand-guide" }); }}>
            <Palette className="size-4" /> <span>Brand Guide</span>
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); navigate({ to: "/settings" }); }}>
            <Settings className="size-4" /> <span>Einstellungen</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projekte">
          {projects.map((p) => (
            <CommandItem
              key={p.id}
              onSelect={() => {
                onOpenChange(false);
                navigate({ to: "/project/$projectId/site-audit", params: { projectId: p.id } });
              }}
            >
              <span className="text-base">{p.countryFlag}</span>
              <span className="flex-1">{p.name}</span>
              <span className="text-[10px] text-mono text-ink-subtle">{p.domain}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Schnellaktionen">
          <CommandItem><Sparkles className="size-4" /> AI-Zusammenfassung erstellen</CommandItem>
          <CommandItem><FileBarChart className="size-4" /> Neuen Report erstellen</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
