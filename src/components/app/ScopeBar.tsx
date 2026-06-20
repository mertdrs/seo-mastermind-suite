import { Calendar, Globe, RotateCcw } from "lucide-react";
import { COUNTRIES, PERIOD_LABEL, useScope, type Period } from "@/lib/scope-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Globale Scope-Steuerung im Header.
 * Setzt Land + Zeitraum für die gesamte App (Single Source of Truth).
 */
export function ScopeBar() {
  const { country, setCountry, period, setPeriod } = useScope();
  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-muted/70 px-2.5 py-1.5 text-xs font-medium"
            aria-label="Land wählen"
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="hidden sm:inline">{country.label}</span>
            <Globe className="size-3 text-ink-subtle" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-mono">Land</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {COUNTRIES.map((c) => (
            <DropdownMenuItem key={c.code} onClick={() => setCountry(c)} className="gap-2">
              <span>{c.flag}</span>
              <span className="flex-1">{c.label}</span>
              <span className="text-[10px] text-mono text-ink-subtle">{c.code}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 hover:bg-muted/70 px-2.5 py-1.5 text-xs font-medium"
            aria-label="Zeitraum wählen"
          >
            <Calendar className="size-3.5 text-ink-subtle" />
            <span>{PERIOD_LABEL[period]}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-mono">Zeitraum</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
            <DropdownMenuItem key={p} onClick={() => setPeriod(p)}>
              {PERIOD_LABEL[p]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Optionaler Override-Hinweis falls eine Seite vom globalen Scope abweicht.
 * Zeigt Reset-Button.
 */
export function ScopeOverrideChip({
  active,
  onReset,
  label,
}: {
  active: boolean;
  onReset: () => void;
  label: string;
}) {
  if (!active) return null;
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: "var(--status-info-bg)",
        color: "var(--status-info)",
        borderColor: "color-mix(in oklab, var(--status-info) 30%, transparent)",
        fontFamily: "var(--font-mono)",
      }}
      aria-label="Override zurücksetzen"
    >
      <RotateCcw className="size-3" />
      {label} weicht ab — zurücksetzen
    </button>
  );
}