import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

export function Panel({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass ring-aurora rounded-2xl p-5", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && (
              <h3 className="text-display text-base font-semibold flex items-center gap-2">
                {title}
                {badge && (
                  <span className="rounded-md bg-[color:var(--signal)]/15 text-[10px] tracking-wide px-1.5 py-0.5 font-mono text-[color:var(--signal-foreground)]/80">
                    {badge}
                  </span>
                )}
              </h3>
            )}
            {subtitle && <p className="text-xs text-ink-subtle mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Pill({ children, onClick, active }: { children: ReactNode; onClick?: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-surface-2 hover:bg-muted/70",
      )}
    >
      {children}
    </button>
  );
}

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition border",
        active
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-surface-2 text-ink-muted hover:text-foreground hover:bg-muted/70",
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, title, onClick }: { children: ReactNode; title: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="size-8 grid place-items-center rounded-lg border border-border bg-surface-2 hover:bg-muted/70 transition"
    >
      {children}
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition",
            value === o.id ? "bg-background text-foreground shadow-sm" : "text-ink-muted hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DeltaPill({ value, inverse, suffix = "%" }: { value: number; inverse?: boolean; suffix?: string }) {
  if (!Math.round(value * 10)) {
    return (
      <span className="inline-flex items-center text-[11px] font-mono text-ink-subtle">
        <Minus className="size-3 mr-0.5" /> 0{suffix}
      </span>
    );
  }
  const isGood = inverse ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-mono px-1.5 py-0.5 rounded"
      style={{
        background: `color-mix(in oklab, ${isGood ? "var(--signal)" : "var(--rose)"} 15%, transparent)`,
        color: isGood ? "var(--signal-foreground)" : "var(--rose)",
      }}
    >
      <Icon className="size-3" />
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

export function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 85 ? "var(--signal)" : pct >= 65 ? "var(--violet)" : pct >= 50 ? "var(--amber)" : "var(--rose)";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-mono tabular-nums text-xs w-10 text-right">{value}</span>
    </div>
  );
}

export function KdBar({ value }: { value: number }) {
  const color = value < 30 ? "var(--signal)" : value < 60 ? "var(--amber)" : "var(--rose)";
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono tabular-nums text-xs w-6 text-right">{value}</span>
    </div>
  );
}

export function Th({ children, align = "left" }: { children?: ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <th
      className={cn(
        "px-3 py-2 font-normal whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-ink-subtle text-mono",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td
      className={cn(
        "px-3 py-2.5 whitespace-nowrap text-sm",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs">
      <p className="font-mono text-ink-subtle mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize text-ink-muted">{p.name || p.dataKey}</span>
          <span className="font-mono tabular-nums ml-auto">
            {typeof p.value === "number" ? formatNumber(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-mono text-ink-subtle">
      <span
        className="inline-block w-4 h-0.5"
        style={{ background: dashed ? "transparent" : color, borderTop: dashed ? `2px dashed ${color}` : undefined }}
      />
      {label}
    </span>
  );
}

export function StatusDot({ tone }: { tone: "ok" | "warn" | "bad" | "neutral" }) {
  const c =
    tone === "ok" ? "var(--signal)" : tone === "warn" ? "var(--amber)" : tone === "bad" ? "var(--rose)" : "var(--ink-subtle)";
  return (
    <span
      className="inline-block size-2 rounded-full"
      style={{ background: c, boxShadow: `0 0 0 3px color-mix(in oklab, ${c} 16%, transparent)` }}
    />
  );
}

export function SectionTitle({ children, kicker }: { children: ReactNode; kicker?: string }) {
  return (
    <div className="flex items-center gap-3">
      {kicker && <span className="text-[10px] uppercase tracking-[0.18em] text-mono text-ink-subtle">{kicker}</span>}
      <h2 className="text-display text-lg font-semibold">{children}</h2>
    </div>
  );
}