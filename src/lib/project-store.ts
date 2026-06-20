import { useEffect, useSyncExternalStore } from "react";

export interface StoredProject {
  id: string;
  domain: string;
  name: string;
  countryFlag: string;
  createdAt: number;
  /** Derived/mock state shown in the dashboard list. */
  status: "healthy" | "warning" | "critical" | "crawling";
  lastCrawl: number;
  pages: number;
  onpageScore: number;
  healthEnabled: boolean;
  backlinks: number;
  rankings: number;
}

const KEY = "verity:projects:v1";

const DEFAULTS: StoredProject[] = [
  {
    id: "verity-app",
    domain: "verity.app",
    name: "Verity (Main)",
    countryFlag: "🇺🇸",
    createdAt: Date.now() - 86_400_000 * 30,
    status: "healthy",
    lastCrawl: Date.now() - 1000 * 60 * 47,
    pages: 1284,
    onpageScore: 85,
    healthEnabled: true,
    backlinks: 18420,
    rankings: 12940,
  },
  {
    id: "durasi-agency",
    domain: "durasi-agency.de",
    name: "Durasi Agency",
    countryFlag: "🇩🇪",
    createdAt: Date.now() - 86_400_000 * 12,
    status: "warning",
    lastCrawl: Date.now() - 1000 * 60 * 60 * 2,
    pages: 18,
    onpageScore: 79,
    healthEnabled: true,
    backlinks: 312,
    rankings: 488,
  },
  {
    id: "indie-saas",
    domain: "indie-saas.io",
    name: "Indie SaaS",
    countryFlag: "🇺🇸",
    createdAt: Date.now() - 86_400_000 * 4,
    status: "crawling",
    lastCrawl: Date.now() - 1000 * 60 * 3,
    pages: 240,
    onpageScore: 72,
    healthEnabled: false,
    backlinks: 92,
    rankings: 410,
  },
];

let cache: StoredProject[] | null = null;
const listeners = new Set<() => void>();

function read(): StoredProject[] {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      cache = DEFAULTS;
      localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
      return cache;
    }
    cache = JSON.parse(raw) as StoredProject[];
    return cache;
  } catch {
    cache = DEFAULTS;
    return cache;
  }
}

function write(next: StoredProject[]) {
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

export function useProjects(): StoredProject[] {
  const data = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => DEFAULTS,
  );
  // Hydrate once on client to ensure SSR markup matches stored data.
  useEffect(() => {
    if (typeof window !== "undefined" && cache === null) {
      read();
      listeners.forEach((l) => l());
    }
  }, []);
  return data;
}

export function getProject(id: string): StoredProject | undefined {
  return read().find((p) => p.id === id);
}

export function addProject(input: { domain: string; name?: string; countryFlag?: string }): StoredProject {
  const clean = input.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const id = clean.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-" + Math.random().toString(36).slice(2, 6);
  const p: StoredProject = {
    id,
    domain: clean,
    name: input.name?.trim() || clean,
    countryFlag: input.countryFlag || "🌐",
    createdAt: Date.now(),
    status: "crawling",
    lastCrawl: Date.now(),
    pages: 0,
    onpageScore: 0,
    healthEnabled: true,
    backlinks: 0,
    rankings: 0,
  };
  write([p, ...read()]);
  // Simulate crawl completion shortly after.
  if (typeof window !== "undefined") {
    setTimeout(() => {
      const list = read().map((x) =>
        x.id === p.id
          ? { ...x, status: "healthy" as const, pages: 24 + Math.floor(Math.random() * 200), onpageScore: 70 + Math.floor(Math.random() * 25), backlinks: Math.floor(Math.random() * 800), rankings: Math.floor(Math.random() * 1200) }
          : x,
      );
      write(list);
    }, 3500);
  }
  return p;
}

export function removeProject(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function formatAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "gerade eben";
  if (m < 60) return `vor ${m} Min.`;
  const h = Math.floor(m / 60);
  if (h < 24) return `vor ${h} Std.`;
  const d = Math.floor(h / 24);
  return `vor ${d} Tagen`;
}