import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './statusMeta';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date (earliest)' },
  { value: 'dueDate:desc', label: 'Due date (latest)' },
  { value: 'priority:desc', label: 'Priority (high to low)' },
  { value: 'priority:asc', label: 'Priority (low to high)' },
];

// "all" is used as the Select's sentinel value (Radix Select doesn't allow
// an empty-string item value) and is translated back to "no filter" by
// the parent before it reaches the API.
const ALL = 'all';

// How long to wait after the last keystroke before actually applying the
// search filter (and firing the API request). Keeps typing fast text from
// triggering a request per character.
const SEARCH_DEBOUNCE_MS = 400;

export default function TaskFilters({ filters, onChange }) {
  const sortValue = `${filters.sortBy}:${filters.order}`;

  const hasActiveFilters = filters.status || filters.priority || filters.search;

  // Local state so the input feels instant while typing, even though the
  // parent (and thus the API request) only updates after the debounce.
  // `filters.search` in this app only ever changes as a result of an action
  // taken inside this component (typing here, or the "Clear" button below),
  // so there's no external-prop-change case to resync from — every place
  // that can change it also calls setSearchInput directly, right at the
  // source. That means no useEffect (or render-time ref-diffing, which this
  // project's stricter react-hooks/refs rule also disallows) is needed just
  // to keep the two in sync.
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ search: value || undefined });
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearFilters = () => {
    clearTimeout(debounceRef.current);
    setSearchInput('');
    onChange({ status: undefined, priority: undefined, search: undefined });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by title..."
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status ?? ALL}
          onValueChange={(v) => onChange({ status: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority ?? ALL}
          onValueChange={(v) => onChange({ priority: v === ALL ? undefined : v })}
        >
          <SelectTrigger className="w-35">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All priorities</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortValue}
          onValueChange={(v) => {
            const [sortBy, order] = v.split(':');
            onChange({ sortBy, order });
          }}
        >
          <SelectTrigger className="w-47.5">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
