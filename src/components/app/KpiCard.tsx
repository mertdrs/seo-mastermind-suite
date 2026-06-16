import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Kpi } from "@/lib/mock/seo";
import { formatCurrency, formatNumber } from "@/lib/format";
import { AnimatedNumber } from "./AnimatedNumber";
import { Sparkline } from "./Sparkline";
import { cn } from "@/lib/utils";

function formatValue(kpi: Kpi): (n: number) => string {
  if (kpi.format === "currency") return (n) => formatCurrency(n);
  if (kpi.format === "number") return (n) => formatNumber(n);
  return (n) => Math.round(n).toString() + (kpi.unit ?? "");
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone = Math.abs(kpi.delta) < 0.1 ? "flat" : kpi.delta > 0 ? "up" : "down";
  const Icon = tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : Minus;
  const toneClass =
    tone === "up" ? "text-[color:var(--success)]" : tone === "down" ? "text-[color:var(--danger)]" : "text-muted-foreground";

  return (
    <div
      className={cn(
        "group relative rounded-2xl glass ring-aurora p-5 flex flex-col gap-3 overflow-hidden transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_40px_-12px_oklch(0.78_0.16_200/0.25)]",
        kpi.highlight && "ring-1 ring-[color:var(--aurora-cyan)]/30",
      )}
    >
      {kpi.highlight && (
        <div
          aria-hidden
          className="absolute -inset-px rounded-2xl opacity-60 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--aurora-cyan) 12%, transparent), transparent 60%, color-mix(in oklab, var(--aurora-violet) 12%, transparent))",
          }}
        />
      )}
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            "text-[10px] uppercase tracking-[0.14em] text-mono",
            kpi.highlight ? "text-[color:var(--aurora-cyan)]" : "text-muted-foreground",
          )}
        >
          {kpi.label}
        </span>
        <span className={cn("flex items-center gap-0.5 text-[11px] text-mono", toneClass)}>
          <Icon className="size-3" />
          {Math.abs(kpi.delta).toFixed(1)}%
        </span>
      </div>
      <div className="relative flex items-baseline gap-1.5">
        <AnimatedNumber
          value={kpi.value}
          format={formatValue(kpi)}
          className="text-display text-3xl font-semibold tabular-nums"
        />
      </div>
      <Sparkline
        data={kpi.spark}
        className="relative h-9 w-full"
        stroke={kpi.highlight ? "var(--aurora-cyan)" : "var(--aurora-violet)"}
        fill={
          kpi.highlight
            ? "color-mix(in oklab, var(--aurora-cyan) 18%, transparent)"
            : "color-mix(in oklab, var(--aurora-violet) 18%, transparent)"
        }
      />
    </div>
  );
}