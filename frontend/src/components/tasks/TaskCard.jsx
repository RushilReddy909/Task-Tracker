import { Calendar, MoreVertical, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  STATUS_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
  PRIORITY_ACCENT_CLASSES,
  statusLabel,
  priorityLabel,
} from './statusMeta';
import { cn } from '@/lib/utils';

function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }) {
  const isDone = task.status === 'done';
  const due = formatDueDate(task.dueDate);

  return (
    <Card
      className={cn(
        "h-full border-l-4 transition-shadow hover:shadow-md",
        PRIORITY_ACCENT_CLASSES[task.priority],
        isDone && "opacity-70",
      )}
    >
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-base leading-snug font-semibold text-foreground",
              isDone && "line-through",
            )}
          >
            {task.title}
          </h3>

          <div className="flex shrink-0 items-center gap-0.5">
            {!isDone && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark as complete"
                onClick={() => onComplete(task._id)}
                className="hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-500/15 dark:hover:text-emerald-300"
              >
                <CheckCircle2 />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Task actions"
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(task)}
                >
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap justify-between items-center gap-1.5 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              className={cn("text-[13px]", STATUS_BADGE_CLASSES[task.status])}
            >
              {statusLabel(task.status)}
            </Badge>
            <Badge
              className={cn(
                "text-[13px]",
                PRIORITY_BADGE_CLASSES[task.priority],
              )}
            >
              {priorityLabel(task.priority)}
            </Badge>
          </div>
          <div>
            {due && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                {due}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
