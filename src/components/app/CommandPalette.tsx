import { useEffect, useState } from "react";
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
import { Compass, Search, Activity, Stethoscope, Link2, Sparkles, LayoutDashboard, Swords, FileText, BarChart3, FileBarChart, Settings } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/site-explorer", label: "Site Explorer", icon: Compass },
  { to: "/keywords", label: "Keywords Explorer", icon: Search },
  { to: "/competitors", label: "Competitive Analysis", icon: Swords },
  { to: "/content", label: "Content Explorer", icon: FileText },
  { to: "/rank-tracker", label: "Rank Tracker", icon: Activity },
  { to: "/site-audit", label: "Site Audit", icon: Stethoscope },
  { to: "/backlinks", label: "Backlinks", icon: Link2 },
  { to: "/web-analytics", label: "Web Analytics", icon: BarChart3 },
  { to: "/brand-radar", label: "AI Visibility", icon: Sparkles },
  { to: "/reports", label: "Report Builder", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search modules, projects, keywords…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <CommandItem
                key={n.to}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: n.to });
                }}
              >
                <Icon className="size-4" />
                <span>{n.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem><Sparkles className="size-4" /> Generate AI summary</CommandItem>
          <CommandItem><FileBarChart className="size-4" /> New report</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}