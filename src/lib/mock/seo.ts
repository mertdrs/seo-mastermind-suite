/**
 * Deterministic mock data for the SEO suite.
 * Seeded by domain so previews stay stable across reloads.
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Intent = "informational" | "commercial" | "transactional" | "navigational";

export interface Kpi {
  label: string;
  value: number;
  format: "number" | "currency" | "percent" | "raw";
  delta: number;
  spark: number[];
  highlight?: boolean;
  unit?: string;
}

export interface KeywordRow {
  keyword: string;
  url: string;
  position: number;
  positionDelta: number;
  volume: number;
  kd: number;
  cpc: number;
  traffic: number;
  intent: Intent;
  serpFeatures: string[];
}

export interface TopPage {
  url: string;
  traffic: number;
  trafficShare: number;
  keywords: number;
  topKeyword: string;
  value: number;
}

export interface BacklinkRow {
  domain: string;
  dr: number;
  traffic: number;
  anchorText: string;
  type: "dofollow" | "nofollow" | "ugc";
  firstSeen: string;
  toxicScore: number;
}

export interface AiMention {
  source: string;
  query: string;
  snippet: string;
  sentiment: "positive" | "neutral" | "negative";
  citationType: "direct" | "referenced" | "summary";
  hoursAgo: number;
}

export interface TrafficPoint {
  date: string;
  current: number;
  previous: number;
}

export interface Project {
  id: string;
  domain: string;
  name: string;
  country: string;
  countryFlag: string;
  domainRating: number;
  trafficDelta: number;
  keywordDelta: number;
  issuesNew: number;
  status: "healthy" | "warning" | "critical";
}

const SAMPLE_KEYWORDS_EN = [
  "best project management software",
  "how to rank on google",
  "content marketing strategy",
  "seo audit checklist",
  "ai writing tools",
  "google search console guide",
  "core web vitals optimization",
  "backlink building strategies",
  "keyword research tutorial",
  "schema markup generator",
  "technical seo guide",
  "saas pricing models",
  "headless cms comparison",
  "vector database benchmark",
  "edge computing platforms",
  "ecommerce conversion rate",
  "shopify vs woocommerce",
  "react server components",
  "typescript best practices",
  "design system tokens",
];

const PATHS = [
  "/blog/seo-guide",
  "/resources/checklist",
  "/learn/keyword-research",
  "/case-studies/saas-growth",
  "/products/audit",
  "/pricing",
  "/compare/alternatives",
  "/guides/technical-seo",
  "/glossary/backlinks",
  "/templates/content-brief",
];

const INTENTS: Intent[] = ["informational", "commercial", "transactional", "navigational"];
const SERP_FEATURES = ["AI Overview", "Featured Snippet", "People Also Ask", "Video", "Sitelinks", "Image Pack"];

const REFERRING_DOMAINS = [
  "techcrunch.com", "wired.com", "smashingmagazine.com", "css-tricks.com", "ahrefs.com",
  "moz.com", "searchengineland.com", "hubspot.com", "stripe.com", "vercel.com",
  "github.com", "dev.to", "medium.com", "producthunt.com", "indiehackers.com",
  "reddit.com", "ycombinator.com", "stackoverflow.com", "smashingmag.de", "t3n.de",
  "heise.de", "golem.de", "horizont.net", "internetworld.de", "onlinemarketing.de",
];

const ANCHORS = [
  "this excellent guide", "Verity", "click here", "the full article",
  "their case study", "read more", "comprehensive analysis", "their tool",
  "see the data", "source", "the platform",
];

const AI_SOURCES = ["Perplexity", "ChatGPT Search", "Google AI Overview", "Claude", "Gemini", "You.com"];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function range(rng: () => number, min: number, max: number, round = true): number {
  const v = min + rng() * (max - min);
  return round ? Math.round(v) : v;
}

function spark(rng: () => number, n = 14, base = 60, vol = 25): number[] {
  const out: number[] = [];
  let v = base + rng() * vol;
  for (let i = 0; i < n; i++) {
    v += (rng() - 0.45) * vol * 0.4;
    v = Math.max(5, Math.min(100, v));
    out.push(Number(v.toFixed(1)));
  }
  return out;
}

export function getKpis(domain: string): Kpi[] {
  const rng = mulberry32(hashSeed(domain + ":kpis"));
  return [
    { label: "Domain Rating", value: range(rng, 55, 92), format: "raw", delta: range(rng, -2, 6, false), spark: spark(rng) },
    { label: "Organic Traffic", value: range(rng, 180_000, 4_200_000), format: "number", delta: range(rng, -8, 22, false), spark: spark(rng) },
    { label: "Organic Keywords", value: range(rng, 4_800, 184_000), format: "number", delta: range(rng, -3, 9, false), spark: spark(rng) },
    { label: "Referring Domains", value: range(rng, 1_200, 22_000), format: "number", delta: range(rng, -1, 8, false), spark: spark(rng) },
    { label: "Traffic Value", value: range(rng, 80_000, 1_800_000), format: "currency", delta: range(rng, -5, 18, false), spark: spark(rng) },
    {
      label: "AI Visibility",
      value: range(rng, 32, 89),
      format: "raw",
      unit: "%",
      delta: range(rng, -2, 14, false),
      spark: spark(rng),
      highlight: true,
    },
  ];
}

export function getHealthScore(domain: string) {
  const rng = mulberry32(hashSeed(domain + ":health"));
  const overall = range(rng, 62, 96);
  return {
    overall,
    breakdown: [
      { label: "Crawlability", score: range(rng, 75, 100) },
      { label: "Core Web Vitals", score: range(rng, 55, 98) },
      { label: "Content Quality", score: range(rng, 60, 95) },
      { label: "Authority", score: range(rng, 50, 90) },
      { label: "AEO Readiness", score: range(rng, 40, 88) },
    ],
  };
}

export function getTrafficSeries(domain: string, days = 30): TrafficPoint[] {
  const rng = mulberry32(hashSeed(domain + ":traffic"));
  const out: TrafficPoint[] = [];
  const today = new Date();
  let cur = 1200 + rng() * 800;
  let prev = 1100 + rng() * 700;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    cur += (rng() - 0.45) * 120;
    prev += (rng() - 0.5) * 100;
    cur = Math.max(400, cur);
    prev = Math.max(400, prev);
    out.push({
      date: d.toISOString().slice(0, 10),
      current: Math.round(cur * 30),
      previous: Math.round(prev * 28),
    });
  }
  return out;
}

export function getTopKeywords(domain: string, count = 12): KeywordRow[] {
  const rng = mulberry32(hashSeed(domain + ":kw"));
  return Array.from({ length: count }, () => {
    const kw = pick(rng, SAMPLE_KEYWORDS_EN);
    return {
      keyword: kw,
      url: domain + pick(rng, PATHS),
      position: range(rng, 1, 28),
      positionDelta: range(rng, -8, 8),
      volume: range(rng, 320, 88_000),
      kd: range(rng, 8, 92),
      cpc: Number((rng() * 12).toFixed(2)),
      traffic: range(rng, 80, 28_000),
      intent: pick(rng, INTENTS),
      serpFeatures: SERP_FEATURES.filter(() => rng() > 0.65).slice(0, 2),
    };
  }).sort((a, b) => b.traffic - a.traffic);
}

export function getTopPages(domain: string, count = 8): TopPage[] {
  const rng = mulberry32(hashSeed(domain + ":pages"));
  const total = 100;
  const items = Array.from({ length: count }, () => ({
    url: domain + pick(rng, PATHS),
    traffic: range(rng, 800, 120_000),
    trafficShare: 0,
    keywords: range(rng, 12, 1_800),
    topKeyword: pick(rng, SAMPLE_KEYWORDS_EN),
    value: range(rng, 200, 45_000),
  })).sort((a, b) => b.traffic - a.traffic);
  const sum = items.reduce((s, x) => s + x.traffic, 0);
  items.forEach((x) => (x.trafficShare = Number(((x.traffic / sum) * total).toFixed(1))));
  return items;
}

export function getBacklinks(domain: string, count = 10): BacklinkRow[] {
  const rng = mulberry32(hashSeed(domain + ":bl"));
  return Array.from({ length: count }, () => ({
    domain: pick(rng, REFERRING_DOMAINS),
    dr: range(rng, 28, 94),
    traffic: range(rng, 100, 850_000),
    anchorText: pick(rng, ANCHORS),
    type: rng() > 0.25 ? "dofollow" : rng() > 0.5 ? "nofollow" : "ugc",
    firstSeen: `${range(rng, 1, 60)}d ago`,
    toxicScore: range(rng, 0, 18),
  })).sort((a, b) => b.dr - a.dr);
}

export function getAiMentions(domain: string, count = 5): AiMention[] {
  const rng = mulberry32(hashSeed(domain + ":ai"));
  return Array.from({ length: count }, () => ({
    source: pick(rng, AI_SOURCES),
    query: pick(rng, SAMPLE_KEYWORDS_EN),
    snippet: `According to ${domain}, the recommended approach combines technical fundamentals with consistent content velocity to drive organic results.`,
    sentiment: rng() > 0.25 ? "positive" : rng() > 0.5 ? "neutral" : "negative",
    citationType: rng() > 0.45 ? "direct" : rng() > 0.5 ? "referenced" : "summary",
    hoursAgo: range(rng, 1, 72),
  }));
}

export function getReferringDomainsGrowth(domain: string) {
  const rng = mulberry32(hashSeed(domain + ":rd"));
  const out: { date: string; total: number; gained: number; lost: number }[] = [];
  const today = new Date();
  let total = 8000 + rng() * 4000;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const gained = Math.round(rng() * 80 + 20);
    const lost = Math.round(rng() * 40 + 5);
    total += gained - lost;
    out.push({ date: d.toISOString().slice(0, 10), total: Math.round(total), gained, lost });
  }
  return out;
}

export const PROJECTS: Project[] = [
  { id: "verity-app", domain: "verity.app", name: "Verity (Main)", country: "US", countryFlag: "🇺🇸", domainRating: 64, trafficDelta: 12.4, keywordDelta: 8.1, issuesNew: 3, status: "healthy" },
  { id: "zeit-digital", domain: "zeit.de/digital", name: "ZEIT Digital", country: "DE", countryFlag: "🇩🇪", domainRating: 88, trafficDelta: -2.1, keywordDelta: 1.4, issuesNew: 12, status: "warning" },
  { id: "indie-saas", domain: "indie-saas.io", name: "Indie SaaS", country: "US", countryFlag: "🇺🇸", domainRating: 41, trafficDelta: 28.7, keywordDelta: 22.3, issuesNew: 1, status: "healthy" },
  { id: "luxus-shop", domain: "luxus-shop.de", name: "Luxus Shop", country: "DE", countryFlag: "🇩🇪", domainRating: 52, trafficDelta: -8.4, keywordDelta: -4.2, issuesNew: 28, status: "critical" },
];

export const ACTIVITY_FEED = [
  { kind: "rank_up", title: "ai writing tools", detail: "Position 8 → 3 (verity.app)", delta: 5, ago: "12m" },
  { kind: "new_backlink", title: "techcrunch.com", detail: "DR 93 · dofollow · /products/audit", ago: "47m" },
  { kind: "issue", title: "12 pages with slow LCP", detail: "ZEIT Digital · Core Web Vitals", ago: "2h" },
  { kind: "ai_mention", title: "Cited by Perplexity", detail: "Query: \"best seo tools 2025\"", ago: "3h" },
  { kind: "rank_down", title: "shopify vs woocommerce", detail: "Position 4 → 11 (luxus-shop.de)", delta: -7, ago: "5h" },
  { kind: "new_backlink", title: "vercel.com", detail: "DR 87 · dofollow · /blog/headless", ago: "8h" },
  { kind: "rank_up", title: "core web vitals optimization", detail: "Position 14 → 6 (verity.app)", delta: 8, ago: "11h" },
] as const;