import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskEmptyState({
  title,
  hint,
  onAdd,
}: {
  title: string;
  hint?: string;
  onAdd?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
      <ClipboardList className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      {onAdd ? (
        <Button className="mt-4" onClick={onAdd}>
          <Plus className="h-4 w-4" aria-hidden />
          Add Task
        </Button>
      ) : null}
    </div>
  );
}
