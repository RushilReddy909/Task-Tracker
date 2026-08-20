import { Cell, Pie, PieChart } from 'recharts';
import { CheckCircle2, CircleDashed, ClipboardList, TrendingUp } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useAnalyticsQuery } from '@/hooks/useTasks';

// Mirrors the hue families used for status badges elsewhere (slate -> sky ->
// emerald) so the donut chart's slices read as the same categories the rest
// of the app already trained the user on. Hardcoded to the same oklch values
// Tailwind ships for these shades, rather than referencing `--color-*` vars
// directly — Tailwind v4 only emits a `--color-*` variable for shades that
// are actually used as a utility class elsewhere in the compiled CSS, and
// "slate-400" isn't (only slate-100/200/300/500/700 are, via the status
// badges), so relying on the variable here would silently break if those
// unrelated classes ever changed.
const STATUS_CHART_CONFIG = {
  todo: { label: 'To Do', color: 'oklch(0.704 0.04 256.788)' }, // slate-400
  inProgress: { label: 'In Progress', color: 'oklch(0.685 0.169 237.323)' }, // sky-500
  done: { label: 'Done', color: 'oklch(0.696 0.17 162.48)' }, // emerald-500
};

// Each stat gets its own accent color so the row reads at a glance instead
// of four identical gray cards — blue for the neutral/overview stat, emerald
// for completed, amber for pending, teal for the completion rate. The
// completion-rate card originally used the theme's `--primary` token (to
// echo the app's brand color), but that token is a deliberately muted, low-
// chroma teal meant for UI chrome (buttons, focus rings) — next to the
// other three cards' vivid Tailwind `-700`/`-800` palette shades it read as
// noticeably darker/duller. Using `teal-700` instead keeps the same hue
// family but matches the others' saturation and lightness.
const STAT_ACCENTS = {
  blue: {
    iconWrap: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    value: 'text-blue-700 dark:text-blue-300',
  },
  emerald: {
    iconWrap: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    iconWrap: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    value: 'text-amber-700 dark:text-amber-300',
  },
  teal: {
    iconWrap: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    value: 'text-teal-700 dark:text-teal-300',
  },
};

function StatCard({ label, value, icon: Icon, isLoading, accent }) {
  const colors = STAT_ACCENTS[accent];
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base font-medium text-muted-foreground">{label}</CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-md ${colors.iconWrap}`}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p className={`text-3xl font-semibold ${colors.value}`}>{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useAnalyticsQuery();

  const chartData = data
    ? [
        { status: 'todo', count: data.todo, fill: STATUS_CHART_CONFIG.todo.color },
        { status: 'inProgress', count: data.inProgress, fill: STATUS_CHART_CONFIG.inProgress.color },
        { status: 'done', count: data.done ?? data.completed, fill: STATUS_CHART_CONFIG.done.color },
      ]
    : [];

  const hasData = data && data.total > 0;

  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">An overview of your task activity.</p>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load analytics. Please try again.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total tasks"
                value={data?.total ?? 0}
                icon={ClipboardList}
                isLoading={isLoading}
                accent="blue"
              />
              <StatCard
                label="Completed"
                value={data?.completed ?? 0}
                icon={CheckCircle2}
                isLoading={isLoading}
                accent="emerald"
              />
              <StatCard
                label="Pending"
                value={data?.pending ?? 0}
                icon={CircleDashed}
                isLoading={isLoading}
                accent="amber"
              />
              <StatCard
                label="Completion rate"
                value={`${data?.completionPercent ?? 0}%`}
                icon={TrendingUp}
                isLoading={isLoading}
                accent="teal"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex aspect-video items-center justify-center">
                    <Skeleton className="size-48 rounded-full" />
                  </div>
                ) : !hasData ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      No tasks yet — create one to see your breakdown here.
                    </p>
                  </div>
                ) : (
                  <ChartContainer
                    config={STATUS_CHART_CONFIG}
                    className="mx-auto aspect-square w-full max-w-md max-h-80"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent nameKey="status" hideLabel />}
                      />
                      {/* Percentage radii instead of a fixed pixel innerRadius: a
                          fixed 60px innerRadius left almost no room for the
                          donut's ring on small/narrow containers (e.g. a phone
                          screen), where the computed outerRadius could shrink to
                          within a few px of — or smaller than — that fixed
                          value, making Recharts render zero visible slices.
                          Percentages scale with the container instead, so the
                          ring stays proportionally correct at every size. */}
                      <Pie
                        data={chartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius="55%"
                        outerRadius="80%"
                        strokeWidth={2}
                      >
                        {chartData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
