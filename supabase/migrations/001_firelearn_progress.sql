-- FireLearn Supabase schema
-- Apply in Supabase SQL editor after auth is enabled.
-- This schema is designed for offline-first sync: local queue items upsert/insert into these tables.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  department_name text,
  role text default 'learner' check (role in ('learner', 'instructor', 'department_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  lesson_id text not null,
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  completed_at timestamptz not null default now(),
  client_mutation_id text,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  score_percent integer not null check (score_percent between 0 and 100),
  weak_topic_ids text[] not null default '{}',
  completed_at timestamptz not null,
  client_mutation_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  ease_factor numeric(4,2) not null check (ease_factor >= 1.30),
  interval_days integer not null check (interval_days >= 0),
  review_count integer not null check (review_count >= 0),
  next_review timestamptz not null,
  reviewed_at timestamptz not null,
  client_mutation_id text,
  created_at timestamptz not null default now()
);

create index if not exists lesson_completions_user_completed_idx on public.lesson_completions (user_id, completed_at desc);
create index if not exists quiz_attempts_user_completed_idx on public.quiz_attempts (user_id, completed_at desc);
create index if not exists flashcard_reviews_user_card_idx on public.flashcard_reviews (user_id, card_id, reviewed_at desc);

alter table public.profiles enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.flashcard_reviews enable row level security;

create policy "Profiles are readable by owner" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Profiles are upsertable by owner" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Profiles are updateable by owner" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Lesson completions readable by owner" on public.lesson_completions
  for select using (auth.uid() = user_id);

create policy "Lesson completions insertable by owner" on public.lesson_completions
  for insert with check (auth.uid() = user_id);

create policy "Lesson completions updateable by owner" on public.lesson_completions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Quiz attempts readable by owner" on public.quiz_attempts
  for select using (auth.uid() = user_id);

create policy "Quiz attempts insertable by owner" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

create policy "Flashcard reviews readable by owner" on public.flashcard_reviews
  for select using (auth.uid() = user_id);

create policy "Flashcard reviews insertable by owner" on public.flashcard_reviews
  for insert with check (auth.uid() = user_id);
