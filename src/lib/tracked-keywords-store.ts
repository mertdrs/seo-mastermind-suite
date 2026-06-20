import { useSyncExternalStore } from "react";

export interface TrackedKeyword {
  keyword: string;
  url?: string;
  source: "keywordsExplorer" | "competitiveGap" | "siteExplorer" | "contentExplorer";
  tag?: string;
  addedAt: number;
}

const KEY = "verity:tracked-keywords:v1";
let cache: TrackedKeyword[] | null = null;
const listeners = new Set<() => void>();

function read(): TrackedKeyword[] {
  if (cache) return cache;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as TrackedKeyword[]) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: TrackedKeyword[]) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useTrackedKeywords(): TrackedKeyword[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => read(),
    () => [],
  );
}

export function isTracked(keyword: string): boolean {
  return read().some((t) => t.keyword.toLowerCase() === keyword.toLowerCase());
}

export function trackKeyword(input: Omit<TrackedKeyword, "addedAt">): TrackedKeyword | null {
  if (isTracked(input.keyword)) return null;
  const next: TrackedKeyword = { ...input, addedAt: Date.now() };
  write([next, ...read()]);
  return next;
}

export function untrackKeyword(keyword: string) {
  write(read().filter((t) => t.keyword.toLowerCase() !== keyword.toLowerCase()));
}