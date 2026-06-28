-- FireLearn progress persistence
-- Tracks per-user course progress and quiz attempt history.
-- Works with anonymous Supabase auth (each anonymous user gets a row in auth.users).

-- Per-course progress (0..1), one row per user per course
create table if not exists public.course_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  progress real not null default 0 check (progress >= 0 and progress <= 1),
  completed_lessons int not null default 0 check (completed_lessons >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

-- Quiz attempt history, one row per completed quiz
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  quiz_id text not null,
  quiz_title text not null,
  score int not null check (score >= 0 and score <= 100),
  total_questions int not null default 0 check (total_questions >= 0),
  taken_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_taken_idx on public.quiz_attempts (user_id, taken_at desc);

-- Row Level Security: users may only read/write their own rows
alter table public.course_progress enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "course_progress_select_own" on public.course_progress;
drop policy if exists "course_progress_insert_own" on public.course_progress;
drop policy if exists "course_progress_update_own" on public.course_progress;
drop policy if exists "course_progress_delete_own" on public.course_progress;

create policy "course_progress_select_own" on public.course_progress
  for select using (auth.uid () = user_id);
create policy "course_progress_insert_own" on public.course_progress
  for insert with check (auth.uid () = user_id);
create policy "course_progress_update_own" on public.course_progress
  for update using (auth.uid () = user_id);
create policy "course_progress_delete_own" on public.course_progress
  for delete using (auth.uid () = user_id);

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
drop policy if exists "quiz_attempts_delete_own" on public.quiz_attempts;

create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select using (auth.uid () = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check (auth.uid () = user_id);
create policy "quiz_attempts_delete_own" on public.quiz_attempts
  for delete using (auth.uid () = user_id);
