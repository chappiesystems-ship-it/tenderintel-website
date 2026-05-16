-- Create a waitlist table for the TenderIntel landing page
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company text,
  sector text,
  notes text,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

create policy "anon_insert_waitlist" on waitlist
  for insert
  to anon
  with check (true);

create policy "authenticated_read_waitlist" on waitlist
  for select
  to authenticated
  using (true);
