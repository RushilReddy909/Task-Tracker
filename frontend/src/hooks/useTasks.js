import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api/axiosInstance';

// Central query key builder — keeping filters in the key means TanStack
// Query automatically treats each distinct filter/sort/page combination
// as its own cached entry, and refetches only when one of them changes.
const taskKeys = {
  all: ['tasks'],
  list: (filters) => [...taskKeys.all, 'list', filters],
  analytics: ['tasks', 'analytics'],
};

async function fetchTasks(filters) {
  // Drop empty/undefined values so the query string stays clean (e.g. no
  // ?status=&search= for filters the user hasn't set).
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const res = await api.get('/tasks', { params });
  return res.data; // { tasks, total, page, pages }
}

async function fetchAnalytics() {
  const res = await api.get('/tasks/analytics');
  return res.data; // { total, completed, pending, inProgress, todo, completionPercent }
}

export function useAnalyticsQuery() {
  return useQuery({
    queryKey: taskKeys.analytics,
    queryFn: fetchAnalytics,
  });
}

export function useTasksQuery(filters) {
  // keepPreviousData avoids the list flashing empty while a new page/filter
  // is loading, but it also means `isLoading` stays false after the first
  // fetch — TanStack Query still flags in-flight background fetches via
  // `isFetching`, so the caller uses that to show a skeleton instead of
  // silently rendering stale data during a filter change.
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
    // Every mutation changes task counts, so analytics must refresh too.
    queryClient.invalidateQueries({ queryKey: taskKeys.analytics });
  };
}

export function useCreateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (data) => api.post('/tasks', data).then((res) => res.data.task),
    onSuccess: () => {
      invalidate();
      toast.success('Task created');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    },
  });
}

export function useUpdateTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/tasks/${id}`, data).then((res) => res.data.task),
    onSuccess: () => {
      invalidate();
      toast.success('Task updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task');
    },
  });
}

export function useCompleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id) => api.patch(`/tasks/${id}/complete`).then((res) => res.data.task),
    onSuccess: () => {
      invalidate();
      toast.success('Task marked complete');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update task');
    },
  });
}

export function useDeleteTask() {
  const invalidate = useInvalidateTasks();
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('Task deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    },
  });
}

export { taskKeys };
