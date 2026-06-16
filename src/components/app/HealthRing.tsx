import { AnimatedNumber } from "./AnimatedNumber";

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export function HealthRing({ score, size = 160, label = "Health Score" }: Props) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 85 ? "var(--success)" : score >= 65 ? "var(--aurora-cyan)" : score >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id="hr-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor="var(--aurora-violet)" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#hr-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 10px color-mix(in oklab, ${color} 70%, transparent))`,
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-display text-5xl font-bold tabular-nums" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono mt-1">{label}</span>
      </div>
    </div>
  );
}