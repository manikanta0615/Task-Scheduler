import { supabase } from "@/integrations/supabase/client";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  priority: TaskPriority;
  status: TaskStatus;
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You must be signed in to manage tasks.");
  return data.user.id;
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true, nullsFirst: false });
  if (error) throw new Error("Could not load tasks. Please try again.");
  return (data ?? []) as Task[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw new Error("Could not create the task. Please try again.");
  return data as Task;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("Could not update the task. Please try again.");
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error("Could not delete the task. Please try again.");
}

export async function toggleTaskStatus(task: Task): Promise<Task> {
  const next: TaskStatus = task.status === "completed" ? "pending" : "completed";
  return updateTask(task.id, { status: next });
}
