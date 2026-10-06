import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import type { Task } from "@/lib/tasks";
import { getTasks } from "@/lib/tasks";
import { Header } from "@/components/layout/Header";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskFilters, type PriorityFilter, type TaskFilter } from "@/components/tasks/TaskFilters";
import { TaskEmptyState } from "@/components/tasks/TaskEmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — Task Scheduler" },
      { name: "description", content: "View, schedule, and manage your daily tasks." },
      { property: "og:title", content: "My Tasks — Task Scheduler" },
      { property: "og:description", content: "View, schedule, and manage your daily tasks." },
    ],
  }),
  component: TasksPage,
});

const priorityRank: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [filter, setFilter] = useState<TaskFilter>("today");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoadError(undefined);
    try {
      setTasks(await getTasks());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === "today" && t.scheduled_date !== today) return false;
        if (filter === "upcoming" && !(t.scheduled_date > today)) return false;
        if (filter === "completed" && t.status !== "completed") return false;
        if (filter === "pending" && t.status !== "pending") return false;
        if (priority !== "all" && t.priority !== priority) return false;
        if (q && !t.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "completed" ? 1 : -1;
        if (a.scheduled_date !== b.scheduled_date)
          return a.scheduled_date < b.scheduled_date ? -1 : 1;
        const ta = a.scheduled_time ?? "99:99";
        const tb = b.scheduled_time ?? "99:99";
        if (ta !== tb) return ta < tb ? -1 : 1;
        return priorityRank[a.priority] - priorityRank[b.priority];
      });
  }, [tasks, filter, search, priority]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  const emptyCopy: Record<TaskFilter, { title: string; hint: string }> = {
    all: { title: "No tasks yet.", hint: "Create your first task to get started." },
    today: { title: "Nothing scheduled for today.", hint: "Add a task to plan your day." },
    upcoming: { title: "No upcoming tasks.", hint: "Schedule something for later." },
    completed: { title: "No completed tasks yet.", hint: "Finished tasks will appear here." },
    pending: { title: "No pending tasks.", hint: "You're all caught up." },
  };

  return (
    <div className="min-h-screen bg-muted">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-foreground">My Tasks</h1>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Task
          </Button>
        </div>

        <TaskFilters
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
        />

        <div className="mt-5 space-y-3" aria-live="polite">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading tasks…
            </div>
          ) : loadError ? (
            <TaskEmptyState title={loadError} hint="Check your connection and try again." />
          ) : visible.length === 0 ? (
            search.trim() ? (
              <TaskEmptyState
                title={`No tasks match "${search.trim()}".`}
                hint="Try a different search term."
              />
            ) : (
              <TaskEmptyState
                title={emptyCopy[filter].title}
                hint={emptyCopy[filter].hint}
                onAdd={openAdd}
              />
            )
          ) : (
            visible.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={openEdit} onChanged={load} />
            ))
          )}
        </div>
      </main>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        onSaved={load}
      />
    </div>
  );
}
