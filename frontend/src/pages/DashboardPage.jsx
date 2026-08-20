import { useState } from 'react';
import { Plus } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import TaskList from '@/components/tasks/TaskList';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskFormDialog from '@/components/tasks/TaskFormDialog';
import TaskPagination from '@/components/tasks/TaskPagination';
import {
  useTasksQuery,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,
} from '@/hooks/useTasks';

const DEFAULT_FILTERS = {
  status: undefined,
  priority: undefined,
  search: undefined,
  page: 1,
  // 12 is evenly divisible by the grid's column counts (1 on mobile, 2 on
  // tablet, 3 on desktop — see TaskList.jsx), so every full page renders
  // as complete rows instead of leaving a lone card dangling on its own.
  limit: 12,
  sortBy: 'createdAt',
  order: 'desc',
};

export default function DashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // isLoading only covers the very first fetch (no cached data yet at all).
  // isFetching also covers every later fetch, including ones triggered by
  // changing a filter — since keepPreviousData keeps the old list mounted
  // during those, TaskList needs isFetching to know to show a skeleton
  // instead of the stale results.
  const { data, isLoading, isFetching, isError } = useTasksQuery(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  // Merges partial filter changes and resets to page 1 whenever a filter
  // (not the page itself) changes, since the previous page number may no
  // longer be valid for a narrower result set.
  const updateFilters = (partial) => {
    const isPageChange = 'page' in partial && Object.keys(partial).length === 1;
    setFilters((prev) => ({
      ...prev,
      ...partial,
      page: isPageChange ? partial.page : 1,
    }));
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask._id, data: formData },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createTask.mutate(formData, { onSuccess: () => setFormOpen(false) });
    }
  };

  const confirmDelete = () => {
    if (!deletingTask) return;
    deleteTask.mutate(deletingTask._id, { onSuccess: () => setDeletingTask(null) });
  };

  return (
    <div className="min-h-svh bg-background">
      <Navbar />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {data?.total ?? 0} task{data?.total === 1 ? '' : 's'} total
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus />
            New task
          </Button>
        </div>

        <TaskFilters filters={filters} onChange={updateFilters} />

        <TaskList
          tasks={data?.tasks}
          isLoading={isLoading || isFetching}
          isError={isError}
          onEdit={openEditDialog}
          onDelete={setDeletingTask}
          onComplete={(id) => completeTask.mutate(id)}
        />

        <TaskPagination
          page={data?.page ?? 1}
          pages={data?.pages ?? 1}
          onPageChange={(page) => updateFilters({ page })}
        />
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleFormSubmit}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />

      <AlertDialog open={Boolean(deletingTask)} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingTask && `"${deletingTask.title}" will be permanently deleted. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteTask.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
