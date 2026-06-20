/**
 * Verity — Strict Token System (Spur A/B/C).
 * Single source of truth for status / score / series colors.
 * Components MUST import from here instead of hardcoding hex or
 * picking arbitrary CSS variables.
 *
 * All values returned are CSS variable references that resolve via
 * the tokens defined in src/styles.css and adapt to light/dark.
 */

/* ---------- Spur B: Score scale (sequenziell) ---------- */

/** Verbindliche Schwellen: <50 / 50–79 / 80+. Gilt überall identisch. */
export function scoreColor(score: number): string {
  if (score < 50) return "var(--score-low)";
  if (score < 80) return "var(--score-mid)";
  return "var(--score-high)";
}

export function scoreLevel(score: number): "low" | "mid" | "high" {
  if (score < 50) return "low";
  if (score < 80) return "mid";
  return "high";
}

/* ---------- Positions-Skala (Rank Tracker) ---------- */

export function positionBucketColor(position: number): string {
  if (position <= 3) return "#16A34A"; // grün
  if (position <= 10) return "#65A30D"; // lime
  if (position <= 20) return "var(--status-warning)";
  if (position <= 50) return "#EA580C"; // orange
  return "var(--status-error)";
}

export const POSITION_BUCKETS = [
  { id: "1-3", label: "1–3", color: "#16A34A" },
  { id: "4-10", label: "4–10", color: "#65A30D" },
  { id: "11-20", label: "11–20", color: "var(--status-warning)" },
  { id: "21-50", label: "21–50", color: "#EA580C" },
  { id: "50+", label: "50+", color: "var(--status-error)" },
] as const;

/* ---------- Spur C: Datenserien (kategorial) ---------- */

/** Liefert eine kategoriale Serienfarbe (zyklisch über 6 Slots). */
export function seriesColor(index: number): string {
  const i = ((index % 6) + 6) % 6;
  return `var(--series-${i + 1})`;
}

/** Optionales zweites Merkmal pro Serie (für A11y bei Multi-Line-Charts). */
export function seriesDash(index: number): string | undefined {
  // solid, dashed, dotted — wiederkehrend
  const patterns = [undefined, "6 3", "2 3", "8 2 2 2", undefined, "4 4"];
  return patterns[((index % 6) + 6) % 6];
}

/* ---------- Wettbewerber-Zuordnung (konsistent überall) ---------- */

export const COMPETITOR_COLOR: Record<string, string> = {
  you: "var(--brand)",
  "verity.app": "var(--brand)",
  "ahrefs.com": "var(--series-1)", // indigo
  "semrush.com": "var(--series-2)", // violett
  "moz.com": "var(--series-3)", // magenta
};

export function competitorColor(domainOrYou: string, fallbackIndex = 0): string {
  const key = domainOrYou.toLowerCase();
  return COMPETITOR_COLOR[key] ?? seriesColor(fallbackIndex);
}

/* ---------- Trend / Delta ---------- */

export type GoodDirection = "up" | "down" | "neutral";

export const METRIC_DIRECTION: Record<string, GoodDirection> = {
  organicTraffic: "up",
  organicKeywords: "up",
  domainRating: "up",
  referringDomains: "up",
  trafficValue: "up",
  aiVisibility: "up",
  searchVolume: "up",
  globalVolume: "up",
  trafficPotential: "up",
  visibility: "up",
  top3: "up",
  totalReach: "up",
  totalShares: "up",
  backlinks: "up",
  shareOfVoice: "up",
  healthScore: "up",

  averagePosition: "down",
  keywordDifficulty: "down",
  affectedUrls: "down",

  cpc: "neutral",
  competition: "neutral",
  movers: "neutral",
};

export type DeltaTone = "up" | "down" | "flat";

/**
 * Bewertet ein Delta nach goodDirection.
 * Liefert die Tönung (semantisch), NICHT die Bewegungsrichtung.
 */
export function getDeltaTone(value: number, metricKey?: string): DeltaTone {
  if (!value || Math.abs(value) < 0.05) return "flat";
  const dir: GoodDirection = (metricKey && METRIC_DIRECTION[metricKey]) || "up";
  if (dir === "neutral") return "flat";
  const movingUp = value > 0;
  const isGood = (dir === "up" && movingUp) || (dir === "down" && !movingUp);
  return isGood ? "up" : "down";
}

export function deltaToneColor(tone: DeltaTone): string {
  if (tone === "up") return "var(--trend-up)";
  if (tone === "down") return "var(--trend-down)";
  return "var(--trend-flat)";
}

/* ---------- Status (Spur A) ---------- */

export type Severity = "error" | "warning" | "info" | "success" | "neutral";

export const SEVERITY_TOKEN: Record<
  Severity,
  { fg: string; bg: string; label: string }
> = {
  error: { fg: "var(--status-error)", bg: "var(--status-error-bg)", label: "Fehler" },
  warning: { fg: "var(--status-warning)", bg: "var(--status-warning-bg)", label: "Warnung" },
  info: { fg: "var(--status-info)", bg: "var(--status-info-bg)", label: "Hinweis" },
  success: { fg: "var(--status-success)", bg: "var(--status-success-bg)", label: "OK" },
  neutral: { fg: "var(--status-neutral)", bg: "var(--status-neutral-bg)", label: "Neutral" },
};