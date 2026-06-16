
# SEO-Suite — Architektur & Erstes Modul

Ziel: Ein modulares, dashboardartiges SEO-Tool mit dem Funktionsumfang von Ahrefs/Seobility, das durch besseres UX, AEO-Fokus (AI-Search-Visibility) und Live-Detailverliebtheit aussticht. Mock-Daten zuerst, echte APIs später nachrüstbar.

## Phase 0 — Design-Direktionen (vor dem Bau)

Ich generiere 3 hochwertige Direktionen (gerendert), du wählst eine. Locked danach für die ganze App.

- **A — "Quant Terminal"**: Dark, datendichte Bloomberg-Ästhetik, Mono-Akzente, grüne/rote Live-Ticker, sharp edges
- **B — "Editorial Clarity"**: Hell, viel Whitespace, ernsthafte Serif-Headlines + präzise Sans, dezent farbige Diagramme (Stripe/Linear-Mix)
- **C — "Aurora OS"**: Modernes Dark-UI mit weichen Aurora-Gradients, Glow-Akzenten, Glasmorphismus auf Karten, sehr „wow"

## Phase 1 — App-Architektur

```text
Layout
├── Sidebar (collapsible, Mini-Mode mit Icons)
│   ├── Workspace-Switcher (Projekte/Portfolios)
│   ├── Suchleiste (⌘K Command Palette)
│   └── Modulgruppen
├── Topbar (Breadcrumbs, Datenbank-Land, Datum, Notifications, User)
└── Outlet (Modul-Content)
```

Routen (TanStack Start, file-based):
```
/                              → Dashboard (Overview aller Projekte)
/projects/$id                  → Projekt-Overview
/projects/$id/site-explorer    → Site Explorer  ← ERSTES VOLLES MODUL
/projects/$id/keywords         → Keywords Explorer
/projects/$id/rank-tracker     → Rank Tracker
/projects/$id/site-audit       → Site Audit
/projects/$id/backlinks        → Backlink-Profil
/projects/$id/content          → Content Explorer
/projects/$id/competitors      → Competitive Analysis
/projects/$id/serp-history     → SERP History
/projects/$id/brand-radar      → AI/AEO Brand Radar
/projects/$id/web-analytics    → Web Analytics
/projects/$id/reports          → Report Builder
/tools/*                       → Freie SEO-Tools (SERP Checker, KD Checker, …)
/settings/*                    → Workspace, Members, API, Integrations
```

Alle Module außer Site Explorer kriegen Shell + realistische Mock-Daten + „Coming soon"-Hinweis für Detail-Drilldowns.

## Phase 2 — Erstes Modul: Site Explorer (voll funktional, Mock-Daten)

Inspiriert von Ahrefs, mit gezielten Verbesserungen:

**Header**
- Domain-Input + Modus (Domain / Subdomain / URL / Prefix)
- Land-Selector, Zeitraum-Picker, Vergleichs-Modus (vs. Vorperiode)
- Aktionen: Export, Add to Project, Share-Link, AI-Summary

**Overview-Section**
- Hero-KPIs: Domain Rating, Organic Traffic, Organic Keywords, Referring Domains, Backlinks, AI Visibility Score *(neu vs. Ahrefs)*
- Sparkline pro KPI, Vergleichs-Delta
- Health-Score-Ring (Tech + Content + Authority kombiniert) *(neu)*

**Tabs im Site Explorer**
1. Overview (Traffic-Chart, Top-Pages, Top-Keywords, Backlink-Wachstum)
2. Organic Keywords (Tabelle mit Filtern: Position, Volume, KD, Intent, SERP-Features)
3. Top Pages (Traffic-Share, Top-Keyword, Word-Count)
4. Backlinks (Referring Domains, DR, Anchor-Cloud, Toxic-Score)
5. Site Structure (Treemap)
6. Outgoing Links
7. Paid Traffic
8. AI Mentions *(neu — AEO)*

**Mock-Daten-Layer**
- `src/lib/mock/site-explorer.ts` mit deterministischen Faker-Daten pro Domain
- Saubere Typen, später 1:1 durch echte Server Functions austauschbar

## Phase 3 — Dashboard-Shell (Mock-Daten)

- Multi-Projekt-Overview-Karten (Traffic-Delta, Position-Änderungen, Audit-Warnungen)
- Activity-Feed (Rank-Gewinner/-Verlierer, neue Backlinks, neue Crawl-Issues)
- Notifications-Panel
- Command Palette (⌘K): Springe zu Modul/Projekt/Keyword/Setting

## Phase 4 — Wow-Effekt-Details

- Animierte Zahlen-Counter (Spring-Animation auf KPI-Mount)
- Charts mit Recharts + sanften Übergangs-Animationen
- Skeleton-Loader, Hover-Tooltips mit Mini-Charts
- Empty States mit Charakter
- Toast-System für Aktionen
- Keyboard-Shortcuts overall (⌘K, J/K Navigation in Tabellen)
- Smooth Page-Transitions (motion)

## Phase 5 — Was wir besser machen als Ahrefs/Seobility

1. **AEO-First** — eigenes Modul „AI Visibility" (Brand Radar) prominent, nicht versteckt
2. **Unified Health Score** — ein Score pro Projekt (Tech + Content + Authority + AEO)
3. **Command Palette** überall — sofortige Navigation, kein Klick-Marathon
4. **Vergleichs-Modus** standardmäßig in jeder Ansicht (Periode + Wettbewerber)
5. **AI-Summary-Button** auf jedem Report (Mock jetzt, später Lovable AI Gateway)
6. **Klares UI** statt Ahrefs' Daten-Overload — progressive Disclosure
7. **Live-Activity-Feed** im Dashboard statt nur statischer Reports

## Phase 6 — Backend-Vorbereitung (noch nicht aktivieren)

Strukturelle Vorbereitung für später:
- Auth-fähige Routen-Struktur (`_authenticated/` Layout vorbereitet, aber Demo-Mode aktiv)
- Server-Function-Stubs in `src/lib/seo.functions.ts` die aktuell Mock liefern, später APIs anbinden
- Klare DTO-Typen in `src/types/seo.ts`

Lovable Cloud (Auth, DB) + echte API-Connectors (Semrush, Firecrawl, DataForSEO) aktivieren wir, wenn du das erste Modul abgenommen hast.

## Was nach diesem Schritt kommt

1. Design-Direktion wählen → ich baue Phase 1–5
2. Du testest Site Explorer + Dashboard-Shell
3. Wir wählen das nächste Modul, das voll funktional wird (Vorschlag: Keywords Explorer oder Site Audit)
4. Backend & echte Daten anbinden

---

**Technische Notizen (für Entwickler)**
- Stack: TanStack Start v1, Tailwind v4, shadcn/ui, Recharts, lucide-react, motion
- Routing: file-based unter `src/routes/`, `_authenticated/` Layout für Projekt-Routen
- State: TanStack Query mit Mock-Funktionen (später echte Server Functions)
- Design-Tokens in `src/styles.css` (`@theme`), keine Hardcoded-Farben in Components
- Sidebar: shadcn `Sidebar` (collapsible="icon"), Command Palette via `cmdk`
- Faker-Daten deterministisch via seeded RNG für stabile Demos
