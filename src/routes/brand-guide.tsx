import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brand-guide")({
  head: () => ({ meta: [{ title: "Brand Guide — Verity" }] }),
  component: Page,
});

// ============================================================
// Token data — single source of truth for this page
// ============================================================

type Swatch = { name: string; token: string; value: string; note?: string };

const CORE_NEUTRALS: Swatch[] = [
  { name: "Background", token: "--background", value: "oklch(0.985 0.004 270)", note: "App canvas" },
  { name: "Foreground", token: "--foreground", value: "oklch(0.18 0.014 270)", note: "Primary text" },
  { name: "Surface", token: "--surface", value: "oklch(1 0 0)", note: "Cards, panels" },
  { name: "Surface 2", token: "--surface-2", value: "oklch(0.965 0.005 270)", note: "Elevated muted" },
  { name: "Surface 3", token: "--surface-3", value: "oklch(0.935 0.008 270)", note: "Accents, hover" },
];

const INK: Swatch[] = [
  { name: "Ink", token: "--ink", value: "oklch(0.18 0.014 270)", note: "Headings" },
  { name: "Ink Muted", token: "--ink-muted", value: "oklch(0.42 0.014 270)", note: "Secondary text" },
  { name: "Ink Subtle", token: "--ink-subtle", value: "oklch(0.58 0.012 270)", note: "Tertiary, captions" },
];

const SIGNAL: Swatch[] = [
  { name: "Signal", token: "--signal", value: "oklch(0.78 0.21 134)", note: "Primary brand · success · CTAs" },
  { name: "Signal Foreground", token: "--signal-foreground", value: "oklch(0.16 0.05 134)", note: "Text on signal" },
  { name: "Signal Glow", token: "--signal-glow", value: "oklch(0.78 0.21 134 / 0.45)", note: "Halos, focus rings" },
];

const ACCENTS: Swatch[] = [
  { name: "Amber", token: "--amber", value: "oklch(0.74 0.17 75)", note: "Warning, attention" },
  { name: "Violet", token: "--violet", value: "oklch(0.58 0.22 295)", note: "AI · secondary accent" },
  { name: "Rose", token: "--rose", value: "oklch(0.62 0.19 18)", note: "Highlights" },
  { name: "Destructive", token: "--destructive", value: "oklch(0.6 0.22 25)", note: "Errors, deletion" },
];

const CHARTS: Swatch[] = [
  { name: "Chart 1", token: "--chart-1", value: "oklch(0.78 0.21 134)", note: "Signal green" },
  { name: "Chart 2", token: "--chart-2", value: "oklch(0.58 0.22 295)", note: "Violet" },
  { name: "Chart 3", token: "--chart-3", value: "oklch(0.74 0.17 75)", note: "Amber" },
  { name: "Chart 4", token: "--chart-4", value: "oklch(0.62 0.19 18)", note: "Rose" },
  { name: "Chart 5", token: "--chart-5", value: "oklch(0.62 0.15 200)", note: "Cyan" },
];

const HAIRLINES: Swatch[] = [
  { name: "Hairline", token: "--hairline", value: "oklch(0 0 0 / 0.08)", note: "Default borders" },
  { name: "Hairline Strong", token: "--hairline-strong", value: "oklch(0 0 0 / 0.14)", note: "Inputs, dividers" },
];

const RADII = [
  { name: "sm", token: "--radius-sm", value: "calc(var(--radius) − 4px)" },
  { name: "md", token: "--radius-md", value: "calc(var(--radius) − 2px)" },
  { name: "lg", token: "--radius-lg", value: "var(--radius) · 0.75rem" },
  { name: "xl", token: "--radius-xl", value: "calc(var(--radius) + 4px)" },
  { name: "2xl", token: "--radius-2xl", value: "calc(var(--radius) + 8px)" },
  { name: "3xl", token: "--radius-3xl", value: "calc(var(--radius) + 12px)" },
];

const UTILITIES = [
  { name: "glass", desc: "Translucent surface with backdrop blur + hairline." },
  { name: "glass-elevated", desc: "Elevated glass with stronger shadow & blur." },
  { name: "aurora-canvas", desc: "Radial gradient mesh + soft 64px grid mask." },
  { name: "signal-glow", desc: "Brand ring + halo, used for active CTAs." },
  { name: "hairline", desc: "Apply default 1px border colour token." },
  { name: "text-display", desc: "Display typography (Geist, −0.015em tracking)." },
  { name: "text-mono", desc: "Monospace utility — UPPERCASE for labels/eyebrows." },
  { name: "pulse-dot", desc: "Animated live indicator (status, AI streams)." },
];

const SPACING = [
  { name: "1", value: "4px" },
  { name: "2", value: "8px" },
  { name: "3", value: "12px" },
  { name: "4", value: "16px" },
  { name: "6", value: "24px" },
  { name: "8", value: "32px" },
  { name: "12", value: "48px" },
  { name: "16", value: "64px" },
];

// ============================================================
// Components
// ============================================================

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
      aria-label={`Copy ${text}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
}

function SwatchCard({ s }: { s: Swatch }) {
  return (
    <div className="group glass rounded-xl overflow-hidden border border-border">
      <div
        className="h-24 w-full"
        style={{ background: `var(${s.token})` }}
      />
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">{s.name}</span>
          <CopyButton text={s.token} />
        </div>
        <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {s.token}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono truncate">{s.value}</div>
        {s.note && <div className="text-[11px] text-ink-subtle pt-1">{s.note}</div>}
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        {eyebrow && (
          <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="text-display text-xl lg:text-2xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SwatchGrid({ swatches }: { swatches: Swatch[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {swatches.map((s) => (
        <SwatchCard key={s.token} s={s} />
      ))}
    </div>
  );
}

function Page() {
  return (
    <AppShell title="Brand Guide" subtitle="Verity design system — colours, type, motion, voice">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero */}
        <div className="glass rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(60% 50% at 20% 0%, color-mix(in oklab, var(--signal) 18%, transparent), transparent 60%), radial-gradient(50% 50% at 90% 20%, color-mix(in oklab, var(--violet) 22%, transparent), transparent 60%)",
            }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="size-12 rounded-xl grid place-items-center relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))" }}
            >
              <span className="text-display font-bold text-white text-xl">V</span>
            </div>
            <div>
              <div className="text-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Verity · v1.0
              </div>
              <div className="text-display text-lg font-semibold">Aurora OS — Brand System</div>
            </div>
          </div>
          <h1 className="text-display text-3xl lg:text-5xl font-semibold tracking-tight max-w-3xl">
            A clean, signal-first design language for SEO &amp; AI visibility.
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-2xl">
            Verity's identity is calm and editorial — a white canvas, a single bright signal colour, and
            quiet typography. Every token here is a CSS variable; never hardcode values in components.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Calm", "Signal-first", "Editorial", "Data-honest", "No noise"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full border border-border bg-muted/60 text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Logo */}
        <Section eyebrow="01 — Identity" title="Logo & mark" description="The V mark uses the signal→violet gradient over a clean canvas. Keep clearspace ≥ the mark's height. Never re-colour the gradient or tilt the mark.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
              <div
                className="size-20 rounded-2xl grid place-items-center"
                style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))" }}
              >
                <span className="text-display font-bold text-white text-3xl">V</span>
              </div>
              <div className="text-xs text-muted-foreground">Primary — gradient on light</div>
            </div>
            <div className="rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-foreground">
              <div
                className="size-20 rounded-2xl grid place-items-center"
                style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-violet))" }}
              >
                <span className="text-display font-bold text-white text-3xl">V</span>
              </div>
              <div className="text-xs text-background/70">Inverse — gradient on ink</div>
            </div>
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
              <div className="size-20 rounded-2xl grid place-items-center bg-foreground">
                <span className="text-display font-bold text-background text-3xl">V</span>
              </div>
              <div className="text-xs text-muted-foreground">Monochrome — print, favicon</div>
            </div>
          </div>
        </Section>

        {/* Colour */}
        <Section eyebrow="02 — Colour" title="Core neutrals" description="Backgrounds and surfaces. Light is default; dark mirrors the same DNA inverted.">
          <SwatchGrid swatches={CORE_NEUTRALS} />
        </Section>

        <Section title="Ink (text)" description="Three steps for hierarchy. Never use raw greys.">
          <SwatchGrid swatches={INK} />
        </Section>

        <Section title="Signal — brand primary" description="The one colour that says ‘this matters’. Reserve for CTAs, active states, success and key data.">
          <SwatchGrid swatches={SIGNAL} />
        </Section>

        <Section title="Accents" description="Used sparingly. Amber = caution, Violet = AI/secondary, Rose = highlight, Destructive = errors.">
          <SwatchGrid swatches={ACCENTS} />
        </Section>

        <Section title="Chart palette" description="Fixed series order for all data visualisations to stay recognisable.">
          <SwatchGrid swatches={CHARTS} />
        </Section>

        <Section title="Hairlines" description="Borders are quiet by default. Use strong only where contrast is required (inputs, dividers between regions).">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HAIRLINES.map((s) => (
              <div key={s.token} className="group glass rounded-xl p-4 flex items-center gap-4">
                <div
                  className="h-12 w-24 rounded-md"
                  style={{ border: `1px solid var(${s.token})`, background: "var(--surface)" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <CopyButton text={s.token} />
                  </div>
                  <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.token}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section eyebrow="03 — Typography" title="Type system" description="Geist for display & body, Geist Mono for labels and data. Always tighten display tracking by −0.015em.">
          <div className="glass rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Display · 48px · −0.015em
              </div>
              <div className="text-display text-5xl font-semibold tracking-tight">
                The quiet edge of SEO.
              </div>
            </div>
            <div className="border-t border-border" />
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                H1 · 30px semibold
              </div>
              <h1 className="text-display text-3xl font-semibold">Organic visibility, decoded.</h1>
            </div>
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                H2 · 20px semibold
              </div>
              <h2 className="text-display text-xl font-semibold">Module section heading</h2>
            </div>
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Body · 14px regular
              </div>
              <p className="text-sm">
                A calm, neutral voice. We describe the data, then surface the action.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Caption · 12px muted
              </div>
              <p className="text-xs text-muted-foreground">
                Secondary metadata, timestamps, helper copy.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Label · 10px mono UPPERCASE 0.18em
              </div>
              <div className="text-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Eyebrow · category · status
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Data · mono tabular
              </div>
              <div className="text-mono text-2xl tabular-nums">128,402 · +12.4%</div>
            </div>
          </div>
        </Section>

        {/* Radii & spacing */}
        <Section eyebrow="04 — Form" title="Radius scale">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {RADII.map((r) => (
              <div key={r.name} className="glass rounded-xl p-3 flex flex-col gap-3 items-center text-center">
                <div
                  className="size-16 bg-foreground/90"
                  style={{ borderRadius: `var(${r.token})` }}
                />
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-[10px] text-mono uppercase tracking-widest text-muted-foreground">
                    {r.token}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{r.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing scale" description="Tailwind 4px base. Use multiples of 4 — never odd values.">
          <div className="glass rounded-2xl p-6 space-y-2">
            {SPACING.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground w-10">
                  {s.name}
                </div>
                <div className="h-3 bg-signal rounded-sm" style={{ width: s.value }} />
                <div className="text-xs text-muted-foreground">{s.value}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Surfaces / utilities */}
        <Section eyebrow="05 — Surfaces" title="Material utilities" description="Composable utility classes defined in src/styles.css. Prefer these over ad-hoc backgrounds.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                .glass
              </div>
              <div className="text-sm">Translucent surface · backdrop blur · hairline border</div>
            </div>
            <div className="glass-elevated rounded-2xl p-6">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                .glass-elevated
              </div>
              <div className="text-sm">Elevated card · stronger blur &amp; drop shadow</div>
            </div>
            <div className="aurora-canvas rounded-2xl p-6 min-h-32">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                .aurora-canvas
              </div>
              <div className="text-sm">Hero background · radial mesh + grid mask</div>
            </div>
            <div className="signal-glow rounded-2xl p-6 bg-surface">
              <div className="text-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                .signal-glow
              </div>
              <div className="text-sm">Active CTA / focus halo</div>
            </div>
          </div>
        </Section>

        <Section title="Utility tokens">
          <div className="glass rounded-2xl divide-y divide-border">
            {UTILITIES.map((u) => (
              <div key={u.name} className="flex items-start gap-4 p-4">
                <code className="text-mono text-xs px-2 py-1 rounded bg-muted text-foreground shrink-0">
                  .{u.name}
                </code>
                <div className="text-sm text-muted-foreground">{u.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Components */}
        <Section eyebrow="06 — Components" title="Buttons">
          <div className="glass rounded-2xl p-6 flex flex-wrap gap-3 items-center">
            <button className="px-4 py-2 rounded-lg bg-signal text-signal-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Primary
            </button>
            <button className="px-4 py-2 rounded-lg border border-border bg-surface text-sm font-medium hover:bg-muted/60 transition-colors">
              Secondary
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              Ghost
            </button>
            <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Destructive
            </button>
            <button className="signal-glow px-4 py-2 rounded-lg bg-signal text-signal-foreground text-sm font-semibold">
              CTA · Glow
            </button>
          </div>
        </Section>

        <Section title="Badges & pills">
          <div className="glass rounded-2xl p-6 flex flex-wrap gap-2 items-center">
            <Badge label="Live" color="signal" />
            <Badge label="New" color="violet" />
            <Badge label="Beta" color="amber" />
            <Badge label="Down" color="rose" />
            <Badge label="Neutral" color="muted" />
          </div>
        </Section>

        {/* Voice */}
        <Section eyebrow="07 — Voice" title="Tone of voice" description="Calm, precise, never hype. We name the metric, then explain the move.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-6 border-l-2 border-signal">
              <div className="text-mono text-[10px] uppercase tracking-widest text-signal mb-2">Do</div>
              <ul className="space-y-2 text-sm">
                <li>· "Organic traffic up 12.4% — driven by 8 new top-10 keywords."</li>
                <li>· "Audit found 3 critical issues. Fix to recover ~4k sessions/mo."</li>
                <li>· "AI Overview now cites your /pricing page on 6 prompts."</li>
              </ul>
            </div>
            <div className="glass rounded-2xl p-6 border-l-2 border-destructive">
              <div className="text-mono text-[10px] uppercase tracking-widest text-destructive mb-2">
                Don't
              </div>
              <ul className="space-y-2 text-sm">
                <li>· "🚀 Crushing SEO with AI-powered insights!"</li>
                <li>· "Synergize next-gen growth funnels."</li>
                <li>· "Click here to learn more."</li>
              </ul>
            </div>
          </div>
        </Section>

        <div className="text-center text-xs text-muted-foreground pt-4 pb-2">
          Brand Guide · Verity Aurora OS · v1.0 · All tokens live in{" "}
          <code className="text-mono">src/styles.css</code>
        </div>
      </div>
    </AppShell>
  );
}

function Badge({
  label,
  color,
}: {
  label: string;
  color: "signal" | "violet" | "amber" | "rose" | "muted";
}) {
  const map: Record<string, string> = {
    signal: "bg-[color-mix(in_oklab,var(--signal)_18%,transparent)] text-[color:var(--signal-foreground)] border-[color-mix(in_oklab,var(--signal)_40%,transparent)]",
    violet: "bg-[color-mix(in_oklab,var(--violet)_18%,transparent)] text-[oklch(0.32_0.18_295)] border-[color-mix(in_oklab,var(--violet)_40%,transparent)]",
    amber: "bg-[color-mix(in_oklab,var(--amber)_22%,transparent)] text-[oklch(0.36_0.12_75)] border-[color-mix(in_oklab,var(--amber)_45%,transparent)]",
    rose: "bg-[color-mix(in_oklab,var(--rose)_18%,transparent)] text-[oklch(0.36_0.16_18)] border-[color-mix(in_oklab,var(--rose)_40%,transparent)]",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "text-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border font-semibold",
        map[color],
      )}
    >
      {label}
    </span>
  );
}
