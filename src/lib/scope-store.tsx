import { createContext, useContext, useState, type ReactNode } from "react";

/** Single Source of Truth für Land + Zeitraum. */

export interface Country {
  code: string;
  label: string;
  flag: string;
}
export const COUNTRIES: Country[] = [
  { code: "DE", label: "Deutschland", flag: "🇩🇪" },
  { code: "US", label: "Vereinigte Staaten", flag: "🇺🇸" },
  { code: "GB", label: "Vereinigtes Königreich", flag: "🇬🇧" },
  { code: "FR", label: "Frankreich", flag: "🇫🇷" },
];

export type Period = "7d" | "30d" | "90d" | "12m";
export const PERIOD_LABEL: Record<Period, string> = {
  "7d": "Letzte 7 Tage",
  "30d": "Letzte 30 Tage",
  "90d": "Letzte 90 Tage",
  "12m": "Letzte 12 Monate",
};

interface ScopeCtx {
  country: Country;
  setCountry: (c: Country) => void;
  period: Period;
  setPeriod: (p: Period) => void;
}

const Ctx = createContext<ScopeCtx | null>(null);

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]!);
  const [period, setPeriod] = useState<Period>("30d");
  return (
    <Ctx.Provider value={{ country, setCountry, period, setPeriod }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScope(): ScopeCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Fallback wenn ohne Provider gerendert (z. B. SSR-Tests)
    return {
      country: COUNTRIES[0]!,
      setCountry: () => {},
      period: "30d",
      setPeriod: () => {},
    };
  }
  return v;
}