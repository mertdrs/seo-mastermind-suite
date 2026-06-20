import { useEffect, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- PageTabs ---------- */

export interface PageTab {
  id: string;
  label: string;
  to: string;
  params?: Record<string, string>;
  badge?: string | number;
}

export function PageTabs({ tabs, value, onChange }: { tabs: PageTab[]; value?: string; onChange?: (id: string) => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      role="tablist"
      aria-label="Seiten-Navigation"
      className="flex items-center gap-1 border-b border-border overflow-x-auto -mx-1 px-1"
    >
      {tabs.map((t) => {
        const isActive =
          value !== undefined
            ? value === t.id
            : path === t.to || path.startsWith(t.to + "/");
        const baseCls = cn(
          "relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-t",
          isActive ? "text-foreground" : "text-ink-subtle hover:text-foreground",
        );
        const inner = (
          <>
            <span className="inline-flex items-center gap-1.5">
              {t.label}
              {t.badge !== undefined && (
                <span
                  className="text-[10px] font-mono rounded px-1.5 py-0.5"
                  style={{ background: "var(--status-neutral-bg)", color: "var(--status-neutral)" }}
                >
                  {t.badge}
                </span>
              )}
            </span>
            {isActive && (
              <span
                aria-hidden
                className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full"
                style={{ background: "var(--brand)" }}
              />
            )}
          </>
        );
        if (onChange) {
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(t.id)}
              className={baseCls}
            >
              {inner}
            </button>
          );
        }
        return (
          <Link
            key={t.id}
            to={t.to}
            params={t.params as never}
            role="tab"
            aria-selected={isActive}
            className={baseCls}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

/* ---------- FilterBar ---------- */

export interface FilterChip {
  id: string;
  label: string;
  onRemove?: () => void;
}

export function FilterBar({
  search,
  onSearch,
  placeholder = "Suchen…",
  chips,
  onClearAll,
  children,
}: {
  search?: string;
  onSearch?: (v: string) => void;
  placeholder?: string;
  chips?: FilterChip[];
  onClearAll?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/50 p-2">
      {onSearch && (
        <label className="inline-flex items-center gap-2 flex-1 min-w-[180px] rounded-lg border border-border bg-background px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-ring">
          <Search className="size-3.5 text-ink-subtle" aria-hidden />
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-subtle"
            aria-label={placeholder}
          />
        </label>
      )}
      {children}
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 pl-2 pr-1 py-0.5 text-[11px]"
            >
              {c.label}
              {c.onRemove && (
                <button
                  type="button"
                  onClick={c.onRemove}
                  aria-label={`Filter ${c.label} entfernen`}
                  className="size-4 grid place-items-center rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-ink-subtle hover:text-foreground underline-offset-2 hover:underline"
            >
              alle zurücksetzen
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- DetailDrawer ---------- */

export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className="absolute right-0 top-0 h-full bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-200"
        style={{ width: `min(${width}px, 100vw)` }}
      >
        <header className="flex items-start justify-between gap-3 p-4 border-b border-border">
          <div className="min-w-0">
            <h2 className="text-display text-base font-semibold truncate">{title}</h2>
            {subtitle && <p className="text-xs text-ink-subtle truncate mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="size-8 grid place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </aside>
    </div>
  );
}

/* ---------- Paginator ---------- */

export function Paginator({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-xs">
      <span className="text-ink-subtle font-mono">
        {start.toLocaleString("de-DE")}–{end.toLocaleString("de-DE")} von {total.toLocaleString("de-DE")}
      </span>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Vorherige Seite"
          className="size-7 grid place-items-center rounded border border-border bg-surface-2 hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="font-mono tabular-nums px-2 text-ink-muted">
          {page} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={page >= pages}
          aria-label="Nächste Seite"
          className="size-7 grid place-items-center rounded border border-border bg-surface-2 hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ---------- EmptyState ---------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 gap-2">
      {icon && (
        <div
          className="size-10 grid place-items-center rounded-full mb-1"
          style={{ background: "var(--status-neutral-bg)", color: "var(--status-neutral)" }}
        >
          {icon}
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-ink-subtle max-w-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/* ---------- RealtimeCard ---------- */

export function RealtimeCard({
  label,
  value,
  hint,
  pulse = true,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  pulse?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className={cn("size-2 rounded-full", pulse && "animate-pulse")}
          style={{ background: "var(--status-success)", boxShadow: "0 0 0 4px color-mix(in oklab, var(--status-success) 18%, transparent)" }}
          aria-hidden
        />
        <span
          className="text-[11px] uppercase tracking-[0.12em] font-medium"
          style={{ color: "var(--status-neutral)", fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
      </div>
      <div className="text-display text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <p className="text-[11px] text-ink-subtle">{hint}</p>}
    </div>
  );
}
