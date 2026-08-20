import { Skeleton } from '@/components/ui/skeleton';
import TaskCard from './TaskCard';
import { ClipboardList } from 'lucide-react';

export default function TaskList({ tasks, isLoading, isError, onEdit, onDelete, onComplete }) {
  if (isLoading) {
    // 12 matches the dashboard's page size (see DEFAULT_FILTERS.limit), so
    // a full page of skeletons fills the same grid shape the real results
    // will — no layout jump once data arrives.
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">Couldn&apos;t load your tasks. Please try again.</p>
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
        <ClipboardList className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No tasks found</p>
        <p className="text-sm text-muted-foreground">
          Create a task or adjust your filters to see results here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
