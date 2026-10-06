create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text,
  scheduled_date date not null,
  scheduled_time time,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;

alter table public.tasks enable row level security;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_scheduled_date_idx on public.tasks (scheduled_date);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_user_date_idx on public.tasks (user_id, scheduled_date);