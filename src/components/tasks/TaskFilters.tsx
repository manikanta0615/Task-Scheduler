import { Search } from "lucide-react";
import type { TaskPriority } from "@/lib/tasks";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TaskFilter = "all" | "today" | "upcoming" | "completed" | "pending";
export type PriorityFilter = "all" | TaskPriority;

export function TaskFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  priority,
  onPriorityChange,
}: {
  filter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (p: PriorityFilter) => void;
}) {
  return (
    <div className="space-y-3">
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as TaskFilter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
        <Select value={priority} onValueChange={(v) => onPriorityChange(v as PriorityFilter)}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
