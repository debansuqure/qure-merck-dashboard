-- ============================================================
-- 001_schema.sql  –  Qure–Merck Dashboard
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Programmes ───────────────────────────────────────────────
create table programmes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ── Sites ────────────────────────────────────────────────────
create table sites (
  id            uuid primary key default gen_random_uuid(),
  programme_id  uuid not null references programmes(id) on delete cascade,
  identifier    text not null unique,
  name          text not null,
  country       text not null,
  status        text not null default 'pending'
                  check (status in ('live','pending','blocked')),
  notes         text,
  created_at    timestamptz not null default now()
);

-- ── Milestones ───────────────────────────────────────────────
create table milestones (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  status      text not null default 'pending'
                check (status in ('pending','in_progress','complete','blocked')),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Actions ──────────────────────────────────────────────────
create table actions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  programme_id  uuid references programmes(id) on delete set null,
  site_id       uuid references sites(id) on delete set null,
  owner         text,
  priority      text not null default 'medium'
                  check (priority in ('low','medium','high')),
  due_date      date,
  status        text not null default 'open'
                  check (status in ('open','complete')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Risks ────────────────────────────────────────────────────
create table risks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  programme_id  uuid references programmes(id) on delete set null,
  impact        text,
  mitigation    text,
  owner         text,
  status        text not null default 'open'
                  check (status in ('open','closed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Row Level Security ───────────────────────────────────────
alter table programmes  enable row level security;
alter table sites       enable row level security;
alter table milestones  enable row level security;
alter table actions     enable row level security;
alter table risks       enable row level security;

-- Public: read-only on all tables
create policy "public_read_programmes"  on programmes  for select using (true);
create policy "public_read_sites"       on sites       for select using (true);
create policy "public_read_milestones"  on milestones  for select using (true);
create policy "public_read_actions"     on actions     for select using (true);
create policy "public_read_risks"       on risks       for select using (true);

-- Service role (used by server-side admin client) bypasses RLS automatically.
-- No additional policies needed for writes – the service role key is never
-- exposed to the browser.

-- ── Indexes ──────────────────────────────────────────────────
create index on sites       (programme_id);
create index on milestones  (site_id);
create index on actions     (programme_id);
create index on actions     (site_id);
create index on actions     (status);
create index on risks       (programme_id);
create index on risks       (status);
