/**
 * Erweiterte deterministische Mock-Daten für die Backlinks-Subseiten.
 * Seeded je Domain, damit Previews stabil bleiben.
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: string) {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOMAINS = [
  "techcrunch.com", "wired.com", "smashingmagazine.com", "css-tricks.com",
  "moz.com", "searchengineland.com", "hubspot.com", "stripe.com", "vercel.com",
  "github.com", "dev.to", "medium.com", "producthunt.com", "indiehackers.com",
  "reddit.com", "heise.de", "golem.de", "horizont.net", "t3n.de",
  "spammy-directory-7.tk", "linkfarm-x.ru", "casino-bonus.click", "buy-traffic.xyz",
  "best-tools-2024.pw", "free-backlinks.top",
];

const PATHS = [
  "/blog/seo-trends", "/news/article", "/tools/comparison", "/guides/seo",
  "/category/marketing", "/resources/links", "/2025/02/article", "/topic/saas",
];

const ANCHORS = [
  "Verity", "this seo tool", "best alternative", "click here", "read more",
  "ahrefs alternative", "source", "the platform", "great resource",
];

const TLDs = ["com", "de", "io", "co", "net", "tk", "ru", "xyz", "pw", "top"];

function pick<T>(r: () => number, arr: T[]) { return arr[Math.floor(r() * arr.length)]!; }

export interface NewLinkRow {
  domain: string;
  url: string;
  targetUrl: string;
  anchorText: string;
  dr: number;
  type: "dofollow" | "nofollow" | "ugc";
  firstSeen: string;
}

export function getNewLinks(domain: string, count = 28): NewLinkRow[] {
  const r = rng(domain + ":new");
  return Array.from({ length: count }, (_, i) => ({
    domain: pick(r, DOMAINS),
    url: "https://" + pick(r, DOMAINS) + pick(r, PATHS),
    targetUrl: `/${pick(r, ["blog", "tools", "pricing", "guides"])}/${pick(r, ["seo-guide", "audit", "rank-tracker", "ai"])}`,
    anchorText: pick(r, ANCHORS),
    dr: Math.round(20 + r() * 75),
    type: r() > 0.3 ? "dofollow" : r() > 0.6 ? "nofollow" : "ugc",
    firstSeen: `vor ${1 + Math.floor(r() * 14)}d`,
  }));
}

export interface LostLinkRow extends NewLinkRow {
  reason: "404 auf Quelle" | "Link entfernt" | "nofollow gesetzt" | "Quelle nicht erreichbar";
  lostAt: string;
}

export function getLostLinks(domain: string, count = 22): LostLinkRow[] {
  const r = rng(domain + ":lost");
  const REASONS: LostLinkRow["reason"][] = ["404 auf Quelle", "Link entfernt", "nofollow gesetzt", "Quelle nicht erreichbar"];
  return Array.from({ length: count }, () => ({
    domain: pick(r, DOMAINS),
    url: "https://" + pick(r, DOMAINS) + pick(r, PATHS),
    targetUrl: `/${pick(r, ["blog", "tools", "pricing"])}/${pick(r, ["seo", "audit", "post-1"])}`,
    anchorText: pick(r, ANCHORS),
    dr: Math.round(20 + r() * 80),
    type: r() > 0.3 ? "dofollow" : "nofollow",
    firstSeen: `vor ${30 + Math.floor(r() * 200)}d`,
    reason: pick(r, REASONS),
    lostAt: `vor ${1 + Math.floor(r() * 10)}d`,
  }));
}

export interface BrokenLinkRow {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  status: 404 | 410 | 500 | 301;
  lastChecked: string;
  recoverable: boolean;
}

export function getBrokenLinks(domain: string, count = 18): BrokenLinkRow[] {
  const r = rng(domain + ":broken");
  const STATUS: BrokenLinkRow["status"][] = [404, 404, 404, 410, 500, 301];
  return Array.from({ length: count }, () => {
    const status = pick(r, STATUS);
    return {
      sourceUrl: "https://" + pick(r, DOMAINS) + pick(r, PATHS),
      targetUrl: `https://${domain}${pick(r, PATHS)}`,
      anchorText: pick(r, ANCHORS),
      status,
      lastChecked: `vor ${1 + Math.floor(r() * 7)}d`,
      recoverable: status === 404 || status === 301,
    };
  });
}

export interface DisavowRow {
  domain: string;
  scope: "domain" | "url";
  url?: string;
  reason: string;
  addedAt: string;
  toxicity: number;
  status: "active" | "pending" | "removed";
}

export function getDisavow(domain: string, count = 14): DisavowRow[] {
  const r = rng(domain + ":disavow");
  const REASONS = ["Spam-Netzwerk", "PBN", "Link-Tausch", "Irrelevante Nische", "Casino/Adult", "Hacked Domain"];
  const TOXIC = ["spammy-directory-7.tk", "linkfarm-x.ru", "casino-bonus.click", "buy-traffic.xyz", "best-tools-2024.pw", "free-backlinks.top"];
  return Array.from({ length: count }, (_, i) => ({
    domain: TOXIC[i % TOXIC.length]!,
    scope: r() > 0.4 ? "domain" : "url",
    url: r() > 0.4 ? undefined : `https://${TOXIC[i % TOXIC.length]}${pick(r, PATHS)}`,
    reason: pick(r, REASONS),
    addedAt: `${1 + Math.floor(r() * 60)}d ago`,
    toxicity: 60 + Math.floor(r() * 40),
    status: r() > 0.25 ? "active" : r() > 0.6 ? "pending" : "removed",
  }));
}

export interface AnchorRow {
  anchor: string;
  count: number;
  pct: number;
  dofollowPct: number;
  topReferring: string;
  type: "branded" | "exact" | "partial" | "naked" | "generic" | "image";
}

export function getAnchors(domain: string): AnchorRow[] {
  const r = rng(domain + ":anchors");
  const ANCHOR_DATA: { a: string; t: AnchorRow["type"] }[] = [
    { a: "Verity", t: "branded" },
    { a: "verity.app", t: "naked" },
    { a: "https://verity.app", t: "naked" },
    { a: "seo tool", t: "partial" },
    { a: "ai seo platform", t: "partial" },
    { a: "best seo tool 2026", t: "exact" },
    { a: "click here", t: "generic" },
    { a: "read more", t: "generic" },
    { a: "this guide", t: "generic" },
    { a: "ahrefs alternative", t: "exact" },
    { a: "[image]", t: "image" },
    { a: "source", t: "generic" },
    { a: "the platform", t: "generic" },
    { a: "Verity SEO", t: "branded" },
  ];
  const rows = ANCHOR_DATA.map((a) => ({
    anchor: a.a,
    type: a.t,
    count: 20 + Math.floor(r() * 380),
    dofollowPct: 55 + Math.floor(r() * 40),
    topReferring: pick(r, DOMAINS),
    pct: 0,
  }));
  const sum = rows.reduce((s, x) => s + x.count, 0);
  rows.forEach((x) => (x.pct = Number(((x.count / sum) * 100).toFixed(1))));
  return rows.sort((a, b) => b.count - a.count);
}

export interface RefDomainRow {
  domain: string;
  dr: number;
  links: number;
  dofollow: number;
  firstSeen: string;
  topAnchor: string;
  tld: string;
  category: "Tech" | "News" | "Marketing" | "Community" | "Other";
}

export function getReferringDomainsList(domain: string, count = 40): RefDomainRow[] {
  const r = rng(domain + ":refdomains");
  const CATS: RefDomainRow["category"][] = ["Tech", "News", "Marketing", "Community", "Other"];
  return Array.from({ length: count }, () => {
    const d = pick(r, DOMAINS);
    return {
      domain: d,
      dr: 30 + Math.floor(r() * 65),
      links: 1 + Math.floor(r() * 24),
      dofollow: Math.floor(r() * 18),
      firstSeen: `vor ${1 + Math.floor(r() * 600)}d`,
      topAnchor: pick(r, ANCHORS),
      tld: d.split(".").pop() || "com",
      category: pick(r, CATS),
    };
  }).sort((a, b) => b.dr - a.dr);
}
