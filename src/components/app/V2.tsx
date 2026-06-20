import { useEffect, useState, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Minus, Plus, AlertCircle, AlertTriangle, Info, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";
import {
  METRIC_DIRECTION,
  SEVERITY_TOKEN,
  type Severity,
  deltaToneColor,
  getDeltaTone,
  scoreColor,
  seriesColor,
  seriesDash,
} from "@/lib/tokens";
import { Sparkline } from "./Sparkline";
import { isTracked, trackKeyword } from "@/lib/tracked-keywords-store";
import { toast } from "sonner";

/* ============================================================
   Verity V2 — wiederverwendbare Komponenten gemäß Token-System.
   Diese ersetzen sukzessive die alten KpiCard / HealthRing /
   SevBadge / Pill-basierten Layouts.
   ============================================================ */

/* ---------- MetricCard ---------- */

export interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  metricKey?: string;
  delta?: { value: number; format?: "percent" | "absolute" };
  sparkline?: number[];
  accent?: "default" | "ai";
  className?: string;
}

export function MetricCard({
  label,
  value,
  unit,
  metricKey,
  delta,
  sparkline,
  accent = "default",
  className,
}: MetricCardProps) {
  const accentStyle =
    accent === "ai"
      ? { background: "color-mix(in oklab, var(--ai-accent-bg) 60%, var(--surface))", borderColor: "color-mix(in oklab, var(--ai-accent) 25%, transparent)" }
      : undefined;
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 flex flex-col gap-2",
        className,
      )}
      style={accentStyle}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] uppercase tracking-[0.12em] font-medium"
          style={{ color: accent === "ai" ? "var(--ai-accent)" : "var(--status-neutral)", fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        {delta && <TrendDelta value={delta.value} format={delta.format ?? "percent"} metricKey={metricKey} />}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-display text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-ink-subtle">{unit}</span>}
      </div>
      {sparkline && sparkline.length > 1 && (
        <Sparkline
          data={sparkline}
          className="h-9 w-full"
          stroke={accent === "ai" ? "var(--ai-accent)" : "var(--series-1)"}
          fill={
            accent === "ai"
              ? "color-mix(in oklab, var(--ai-accent) 18%, transparent)"
              : "color-mix(in oklab, var(--series-1) 16%, transparent)"
          }
        />
      )}
    </div>
  );
}

/* ---------- ScoreGauge ---------- */

export interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreGauge({ score, label = "Health Score", size = "md" }: ScoreGaugeProps) {
  const px = size === "sm" ? 72 : size === "lg" ? 168 : 128;
  const stroke = size === "sm" ? 7 : size === "lg" ? 12 : 10;
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = c - (clamped / 100) * c;
  const color = scoreColor(clamped);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: px, height: px }}>
      <svg width={px} height={px} className="rotate-[-90deg]">
        <circle cx={px / 2} cy={px / 2} r={r} stroke="var(--status-neutral-bg)" strokeWidth={stroke} fill="none" />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="text-display font-semibold tabular-nums"
          style={{ fontSize: size === "sm" ? 18 : size === "lg" ? 48 : 32, color }}
        >
          {Math.round(clamped)}
        </span>
        {label && size !== "sm" && (
          <span className="text-[10px] uppercase tracking-[0.16em] mt-1" style={{ color: "var(--status-neutral)", fontFamily: "var(--font-mono)" }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- ScoreBar ---------- */

export function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  const color = scoreColor((score / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-ink-muted w-32 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--status-neutral-bg)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-mono tabular-nums text-xs w-10 text-right">{Math.round(score)}</span>
    </div>
  );
}

/* ---------- StatusBadge ---------- */

const SEV_ICON: Record<Severity, typeof AlertCircle> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  neutral: Circle,
};

export function StatusBadge({
  severity,
  label,
  withIcon = true,
  size = "md",
}: {
  severity: Severity;
  label: string;
  withIcon?: boolean;
  size?: "sm" | "md";
}) {
  const cfg = SEVERITY_TOKEN[severity];
  const Icon = SEV_ICON[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded font-medium tracking-wide",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5",
      )}
      style={{ background: cfg.bg, color: cfg.fg, fontFamily: "var(--font-mono)" }}
    >
      {withIcon && <Icon className={size === "sm" ? "size-3" : "size-3.5"} />}
      <span className="uppercase">{label}</span>
    </span>
  );
}

/* ---------- TrendDelta ---------- */

export function TrendDelta({
  value,
  format = "percent",
  metricKey,
  className,
}: {
  value: number;
  format?: "percent" | "absolute";
  metricKey?: string;
  className?: string;
}) {
  const tone = getDeltaTone(value, metricKey);
  const color = deltaToneColor(tone);
  const Icon = tone === "flat" ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const suffix = format === "percent" ? "%" : "";
  const absVal = Math.abs(value);
  const display = tone === "flat" ? `0${suffix}` : `${absVal.toFixed(absVal < 10 ? 1 : 0)}${suffix}`;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-[11px] font-mono tabular-nums", className)}
      style={{ color }}
      aria-label={`Δ ${value > 0 ? "+" : ""}${value}${suffix}`}
    >
      <Icon className="size-3" />
      {display}
    </span>
  );
}

/* ---------- SeriesLegend ---------- */

export interface SeriesLegendItem {
  label: string;
  color: string;
  dashed?: boolean;
}

export function SeriesLegend({ items, className }: { items: SeriesLegendItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((s) => (
        <li key={s.label} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
          <span
            className="inline-block w-5 h-0.5"
            style={{
              background: s.dashed ? "transparent" : s.color,
              borderTop: s.dashed ? `2px dashed ${s.color}` : undefined,
            }}
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/* Helper für Chart-Generierung */
export function buildSeriesItems(labels: string[]): SeriesLegendItem[] {
  return labels.map((label, i) => ({ label, color: seriesColor(i), dashed: !!seriesDash(i) }));
}

/* ---------- TrackKeywordButton ---------- */

export interface TrackKeywordButtonProps {
  keyword: string;
  url?: string;
  source: "keywordsExplorer" | "competitiveGap" | "siteExplorer" | "contentExplorer";
  size?: "sm" | "md";
}

export function TrackKeywordButton({ keyword, url, source, size = "sm" }: TrackKeywordButtonProps) {
  const [, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tracked = mounted ? isTracked(keyword) : false;

  const sizeCls = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  if (tracked) {
    return (
      <span
        className={cn("inline-flex items-center gap-1 rounded font-medium uppercase tracking-wider", sizeCls)}
        style={{ background: "var(--status-success-bg)", color: "var(--status-success)", fontFamily: "var(--font-mono)" }}
        title="Bereits im Rank Tracker"
      >
        <Check className="size-3" />
        getrackt
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        trackKeyword({ keyword, url, source });
        toast.success(`„${keyword}" zum Rank Tracker hinzugefügt`);
        setTick((t) => t + 1);
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded font-medium uppercase tracking-wider border transition-colors",
        sizeCls,
      )}
      style={{
        background: "var(--status-info-bg)",
        color: "var(--status-info)",
        borderColor: "color-mix(in oklab, var(--status-info) 30%, transparent)",
        fontFamily: "var(--font-mono)",
      }}
      aria-label={`„${keyword}" tracken`}
    >
      <Plus className="size-3" />
      Tracken
    </button>
  );
}