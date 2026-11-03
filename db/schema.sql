-- Kør denne ene gang i pgAdmin (eller Neons SQL Editor) mod jeres Neon-database.

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  quantity text,
  is_checked boolean not null default false,
  added_by text not null,          -- navnet på den der tilføjede varen
  created_at timestamptz not null default now(),
  checked_at timestamptz
);
