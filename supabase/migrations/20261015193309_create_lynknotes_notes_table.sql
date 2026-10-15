create table if not exists public.notes (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 150),
  content text not null default '' check (char_length(content) <= 20000),
  color text not null check (color in ('yellow', 'pink', 'green', 'blue', 'purple', 'peach')),
  kind text not null default 'text' check (kind in ('text', 'checklist')),
  category text not null default 'Pessoal' check (char_length(category) <= 60),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  pinned boolean not null default false,
  archived boolean not null default false,
  deleted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_user_updated_at_idx on public.notes (user_id, updated_at desc);
alter table public.notes enable row level security;
revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;
drop policy if exists "Users can read their own LynkNotes" on public.notes;
create policy "Users can read their own LynkNotes" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own LynkNotes" on public.notes;
create policy "Users can create their own LynkNotes" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own LynkNotes" on public.notes;
create policy "Users can update their own LynkNotes" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete their own LynkNotes" on public.notes;
create policy "Users can delete their own LynkNotes" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);
