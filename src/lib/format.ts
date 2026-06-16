export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1) + "k";
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number, digits = 1): string {
  return (n >= 0 ? "+" : "") + n.toFixed(digits) + "%";
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(1) + "k";
  return "$" + n.toLocaleString("en-US");
}

export function formatDelta(n: number): { label: string; tone: "up" | "down" | "flat" } {
  if (Math.abs(n) < 0.05) return { label: "—", tone: "flat" };
  return { label: (n > 0 ? "+" : "") + n.toFixed(1) + "%", tone: n > 0 ? "up" : "down" };
}