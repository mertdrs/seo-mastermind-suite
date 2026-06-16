import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
    <AppShell title="Dashboard" subtitle="Cross-project overview · Last 30 days vs. previous period">
      {/* Hero KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </section>

      {/* Health + Projects */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        {/* Unified Health Score */}
        <div className="xl:col-span-4 glass ring-aurora rounded-2xl p-6 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-display text-base font-semibold">Unified Health Score</h2>
              <p className="text-xs text-muted-foreground">verity.app · combined SEO + AEO signals</p>
            </div>
            <span className="text-[10px] text-mono uppercase tracking-widest px-2 py-1 rounded-md"
              style={{ background: "color-mix(in oklab, var(--aurora-cyan) 14%, transparent)", color: "var(--aurora-cyan)" }}>
              New
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center my-4">
            <HealthRing score={health.overall} />
          </div>
          <div className="space-y-2.5">
            {health.breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="text-mono tabular-nums">{b.score}</span>
                </div>
                <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${b.score}%`,
                      background:
                        b.score >= 80
                          ? "linear-gradient(90deg, var(--success), var(--aurora-cyan))"
                          : b.score >= 60
                          ? "linear-gradient(90deg, var(--aurora-cyan), var(--aurora-violet))"
                          : "linear-gradient(90deg, var(--warning), var(--danger))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="xl:col-span-8 glass ring-aurora rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-display text-base font-semibold">Projects</h2>
              <p className="text-xs text-muted-foreground">{PROJECTS.length} active · click to open Site Explorer</p>
            </div>
            <Link to="/site-explorer" className="text-xs text-mono uppercase tracking-widest text-[color:var(--aurora-cyan)] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROJECTS.map((p) => {
              const tone = p.trafficDelta >= 0 ? "up" : "down";
              const Icon = tone === "up" ? TrendingUp : TrendingDown;
              const statusColor =
                p.status === "healthy" ? "var(--success)" : p.status === "warning" ? "var(--warning)" : "var(--danger)";
              return (
                <Link
                  key={p.id}
                  to="/site-explorer"
                  className="group relative rounded-xl border border-border bg-muted/40 hover:bg-muted/60 p-4 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-9 shrink-0 rounded-lg grid place-items-center text-lg bg-muted/50">{p.countryFlag}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{p.domain}</span>
                        <span className="size-1.5 rounded-full shrink-0" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-mono text-muted-foreground">
                        <span>DR {p.domainRating}</span>
                        <span className={cn("flex items-center gap-0.5", tone === "up" ? "text-[color:var(--success)]" : "text-[color:var(--danger)]")}>
                          <Icon className="size-3" /> {Math.abs(p.trafficDelta).toFixed(1)}%
                        </span>
                        {p.issuesNew > 0 && (
                          <span className="flex items-center gap-0.5 text-[color:var(--warning)]">
                            <AlertTriangle className="size-3" /> {p.issuesNew}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activity + Quick stats */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 glass ring-aurora rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-display text-base font-semibold">Live activity</h2>
              <p className="text-xs text-muted-foreground">Rank moves, new backlinks, audit alerts</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-mono uppercase tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[color:var(--success)] animate-pulse" />
              Live
            </div>
          </div>
          <ul className="space-y-1">
            {ACTIVITY_FEED.map((a, i) => {
              const cfg = activityConfig(a.kind);
              const Icon = cfg.icon;
              return (
                <li key={i} className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors">
                  <div className="size-8 shrink-0 rounded-lg grid place-items-center" style={{ background: cfg.bg }}>
                    <Icon className="size-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{a.title}</span>
                      {"delta" in a && typeof a.delta === "number" && (
                        <span className={cn("text-[10px] text-mono px-1.5 py-0.5 rounded", a.delta > 0 ? "text-[color:var(--success)] bg-[color:var(--success)]/10" : "text-[color:var(--danger)] bg-[color:var(--danger)]/10")}>
                          {a.delta > 0 ? "+" : ""}{a.delta}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground truncate block">{a.detail}</span>
                  </div>
                  <span className="text-[10px] text-mono text-muted-foreground shrink-0 mt-1">{a.ago}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Differentiators / "what we do better" */}
        <div className="xl:col-span-4 glass ring-aurora rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-[color:var(--aurora-cyan)]" />
            <h2 className="text-display text-base font-semibold">AI Visibility pulse</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-5">How AI search engines cite your brand right now.</p>

          <div className="space-y-3 flex-1">
            {[
              { source: "Perplexity", score: 78, delta: 12 },
              { source: "ChatGPT Search", score: 64, delta: 8 },
              { source: "Google AI Overview", score: 52, delta: -3 },
              { source: "Claude", score: 41, delta: 5 },
            ].map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-xs font-medium w-32 truncate">{s.source}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: "linear-gradient(90deg, var(--aurora-cyan), var(--aurora-violet))" }} />
                </div>
                <span className="text-[11px] text-mono tabular-nums w-10 text-right">{s.score}</span>
                <span className={cn("text-[10px] text-mono w-8 text-right", s.delta > 0 ? "text-[color:var(--success)]" : "text-[color:var(--danger)]")}>
                  {s.delta > 0 ? "+" : ""}{s.delta}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/brand-radar"
            className="mt-5 block text-center text-xs font-semibold text-mono uppercase tracking-widest py-2.5 rounded-xl transition-all hover:brightness-110"
            style={{ background: "color-mix(in oklab, var(--aurora-violet) 18%, transparent)", color: "oklch(0.92 0.06 295)", border: "1px solid color-mix(in oklab, var(--aurora-violet) 30%, transparent)" }}
          >
            Open Brand Radar
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function activityConfig(kind: string) {
  switch (kind) {
    case "rank_up": return { icon: TrendingUp, color: "var(--success)", bg: "color-mix(in oklab, var(--success) 15%, transparent)" };
    case "rank_down": return { icon: TrendingDown, color: "var(--danger)", bg: "color-mix(in oklab, var(--danger) 15%, transparent)" };
    case "new_backlink": return { icon: Link2, color: "var(--aurora-cyan)", bg: "color-mix(in oklab, var(--aurora-cyan) 15%, transparent)" };
    case "issue": return { icon: AlertTriangle, color: "var(--warning)", bg: "color-mix(in oklab, var(--warning) 15%, transparent)" };
    case "ai_mention": return { icon: Sparkles, color: "var(--aurora-violet)", bg: "color-mix(in oklab, var(--aurora-violet) 15%, transparent)" };
    default: return { icon: TrendingUp, color: "var(--muted-foreground)", bg: "rgba(255,255,255,0.05)" };
  }
}

// Silence unused-import warnings when sparkline isn't rendered yet
void Sparkline;
void formatNumber;
