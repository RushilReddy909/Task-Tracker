import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { taskSchema } from '@/schemas/taskSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './statusMeta';

const emptyValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
};

// Converts an ISO date string from the API into the yyyy-mm-dd shape an
// <input type="date"> needs.
function toDateInputValue(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toISOString().slice(0, 10);
}

export default function TaskFormDialog({ open, onOpenChange, task, onSubmit, isSubmitting }) {
  const isEditing = Boolean(task);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  // Reset the form each time the dialog opens, either to the task being
  // edited or back to blank defaults for a new task.
  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              status: task.status,
              priority: task.priority,
              dueDate: toDateInputValue(task.dueDate),
            }
          : emptyValues
      );
    }
  }, [open, task, reset]);

  const submit = (data) => onSubmit(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit task' : 'Create task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} noValidate>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input {...field} id="title" placeholder="What needs to be done?" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Add more detail (optional)"
                    aria-invalid={fieldState.invalid}
                    rows={3}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="priority">Priority</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            <Controller
              name="dueDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
                  <Input {...field} id="dueDate" type="date" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isEditing ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
