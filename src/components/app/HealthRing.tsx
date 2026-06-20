import { AnimatedNumber } from "./AnimatedNumber";
import { scoreColor } from "@/lib/tokens";

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
  const color = scoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--status-neutral-bg)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1), stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-display text-5xl font-bold tabular-nums" />
        <span className="text-[10px] uppercase tracking-[0.18em] text-mono mt-1" style={{ color: "var(--status-neutral)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}