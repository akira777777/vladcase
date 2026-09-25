'use client';
import { Search, ArrowDownUp, SlidersHorizontal } from 'lucide-react';

export type SortMode = 'popular' | 'newest' | 'price_asc' | 'price_desc';

export const SORT_LABELS: Record<SortMode, string> = {
  popular: 'Popular',
  newest: 'Newest',
  price_asc: 'Price Low → High',
  price_desc: 'Price High → Low',
};

interface CategoryTabsProps {
  categories: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  showSort?: boolean;
  sort?: SortMode;
  onSortChange?: (s: SortMode) => void;
}

export default function CategoryTabs({
  categories,
  active,
  onChange,
  showSearch = true,
  searchQuery = '',
  onSearchChange,
  showSort = true,
  sort = 'popular',
  onSortChange,
}: CategoryTabsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`tab-pill ${active === cat.id ? 'tab-pill-active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {(showSearch || showSort) && (
        <div className="flex items-center gap-2">
          {showSearch && onSearchChange && (
            <div className="relative flex-1 md:flex-none md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search cases"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white placeholder:text-text-muted focus:outline-none focus:border-brand/50"
              />
            </div>
          )}
          {showSort && onSortChange && (
            <div className="relative">
              <ArrowDownUp className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortMode)}
                aria-label="Sort cases"
                className="pl-8 pr-7 py-2 rounded-lg text-xs bg-surface-dark border border-white/[0.06] text-white appearance-none focus:outline-none focus:border-brand/50 cursor-pointer"
              >
                {Object.entries(SORT_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            className="p-2 rounded-lg bg-surface-dark border border-white/[0.06] text-text-secondary hover:text-white hover:border-white/20"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}