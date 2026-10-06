import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/tasks";
import { deleteTask, toggleTaskStatus } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const priorityStyles: Record<Task["priority"], string> = {
  high: "border-transparent bg-destructive/15 text-destructive",
  medium: "border-transparent bg-accent text-accent-foreground",
  low: "border-transparent bg-muted text-muted-foreground",
};

export function TaskCard({
  task,
  onEdit,
  onChanged,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const completed = task.status === "completed";

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    try {
      await toggleTaskStatus(task);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the task.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the task.");
      setBusy(false);
    }
  }

  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-opacity",
        completed && "opacity-60",
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={handleToggle}
        disabled={busy}
        aria-label={completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={cn(
              "text-sm font-medium text-foreground",
              completed && "line-through",
            )}
          >
            {task.title}
          </h3>
          <Badge variant="outline" className={priorityStyles[task.priority]}>
            {task.priority}
          </Badge>
          <Badge variant="outline">{task.status}</Badge>
        </div>
        {task.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
        ) : null}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {format(parseISO(task.scheduled_date), "EEE, MMM d, yyyy")}
          {task.scheduled_time ? ` · ${task.scheduled_time.slice(0, 5)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Delete "${task.title}"`}>
              <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
