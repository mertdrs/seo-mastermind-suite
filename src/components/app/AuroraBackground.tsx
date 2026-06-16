export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--aurora-violet)_22%,transparent)_0%,transparent_55%)]" />
      <div className="absolute -top-40 -left-40 size-[55vw] rounded-full blur-[120px] opacity-50 [animation:aurora-drift-1_22s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, oklch(0.78 0.16 200 / 0.55) 0%, transparent 65%)" }} />
      <div className="absolute top-1/3 -right-40 size-[50vw] rounded-full blur-[120px] opacity-45 [animation:aurora-drift-2_28s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.22 295 / 0.55) 0%, transparent 65%)" }} />
      <div className="absolute bottom-0 left-1/3 size-[45vw] rounded-full blur-[120px] opacity-30 [animation:aurora-drift-3_32s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.22 340 / 0.45) 0%, transparent 65%)" }} />
      {/* Subtle grain */}
      <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }} />
    </div>
  );
}