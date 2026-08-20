// Shared display metadata for status/priority values, so every component
// (cards, filters, form selects) renders identical labels and colors.
export const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// Status gets its own distinct hue per stage (slate -> blue -> green),
// separate from priority's palette, so the two badge groups read as
// different categories at a glance rather than blurring together.
export const STATUS_BADGE_CLASSES = {
  todo: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/25',
  'in-progress':
    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/25',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25',
};

// Priority uses a deliberate low -> high color ramp (cool blue -> warm
// amber -> alerting red) so urgency is readable from color alone, not
// just the text label.
export const PRIORITY_BADGE_CLASSES = {
  low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25',
  medium:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25',
  high: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25',
};

// A left accent-bar color per priority, applied to the task card itself
// so priority is visible even before reading any badge text.
export const PRIORITY_ACCENT_CLASSES = {
  low: 'border-l-blue-400 dark:border-l-blue-500',
  medium: 'border-l-amber-400 dark:border-l-amber-500',
  high: 'border-l-rose-500 dark:border-l-rose-500',
};

export function statusLabel(value) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function priorityLabel(value) {
  return PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
