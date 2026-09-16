-- ACME Signal CRM schema
-- Demo/QA database: RLS is enabled with open policies so the client
-- can read/write with the anon key. This app is intentionally shared
-- and reset nightly.

create table public.users (
  id text primary key,
  email text not null,
  full_name text not null default '',
  avatar text not null default '',
  role text not null default 'member' check (role in ('admin', 'member')),
  email_verified boolean not null default false,
  password text,
  created_at timestamptz not null default now()
);

create unique index users_email_lower_idx on public.users (lower(email));

create table public.organizations (
  id text primary key,
  name text not null,
  industry text not null default '',
  location text not null default '',
  employees integer not null default 0,
  logo text not null default '',
  website_url text not null default '',
  description text not null default '',
  deal_stage text not null default 'New',
  annual_revenue text,
  owner text,
  last_contacted date,
  created_at timestamptz not null default now()
);

create table public.collections (
  id text primary key,
  name text not null,
  description text not null default '',
  tags text[] not null default '{}'
);

create table public.collection_organizations (
  collection_id text not null references public.collections (id) on delete cascade,
  organization_id text not null references public.organizations (id) on delete cascade,
  primary key (collection_id, organization_id)
);

create table public.people (
  id text primary key,
  name text not null,
  email text not null default '',
  role text not null default '',
  organization text not null default '',
  phone text,
  linkedin text,
  notes text,
  avatar text,
  status text not null default 'Active' check (status in ('Active', 'Inactive')),
  last_contact date
);

create table public.deals (
  id text primary key,
  title text not null,
  organization_id text references public.organizations (id) on delete set null,
  value numeric not null default 0,
  currency text not null default 'USD',
  stage text not null default 'New',
  expected_close_date date,
  owner text not null default '',
  probability integer not null default 0,
  next_step text,
  tags text[] not null default '{}',
  contact_ids text[] not null default '{}',
  last_activity_date timestamptz,
  last_activity_type text,
  signature_status text,
  signature_sent_at timestamptz,
  signature_recipient_email text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id text primary key,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  assignee text,
  related_deal_id text references public.deals (id) on delete set null,
  related_organization_id text references public.organizations (id) on delete set null,
  related_person_id text references public.people (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.notes (
  id text primary key,
  organization_id text not null references public.organizations (id) on delete cascade,
  content text not null,
  author_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emails (
  id text primary key,
  to_email text not null,
  to_name text,
  subject text not null default '',
  body text,
  status text not null default 'sent' check (status in ('sent', 'delivered', 'failed')),
  type text not null default 'outreach' check (type in ('verification', 'welcome', 'outreach', 'follow_up')),
  sent_at timestamptz not null default now(),
  related_person_id text references public.people (id) on delete set null,
  related_organization_id text references public.organizations (id) on delete set null
);

create table public.activities (
  id text primary key,
  type text not null,
  title text not null,
  description text not null default '',
  timestamp timestamptz not null default now(),
  user_id text,
  user_name text,
  related_entity_id text,
  related_entity_type text,
  read boolean not null default false
);

create table public.custom_reports (
  id text primary key,
  title text not null,
  description text not null default '',
  template_id text,
  type text,
  widgets jsonb not null default '[]'::jsonb,
  is_built_in boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.verification_tokens (
  email text primary key,
  token text not null,
  created_at timestamptz not null default now()
);

create index organizations_name_idx on public.organizations (name);
create index people_organization_idx on public.people (organization);
create index deals_organization_id_idx on public.deals (organization_id);
create index deals_stage_idx on public.deals (stage);
create index notes_organization_id_idx on public.notes (organization_id);
create index tasks_related_deal_id_idx on public.tasks (related_deal_id);
create index tasks_related_organization_id_idx on public.tasks (related_organization_id);
create index emails_related_person_id_idx on public.emails (related_person_id);
create index activities_timestamp_idx on public.activities (timestamp desc);

-- Open RLS for the shared QA demo. Nightly reset wipes mutations.
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.collections enable row level security;
alter table public.collection_organizations enable row level security;
alter table public.people enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.emails enable row level security;
alter table public.activities enable row level security;
alter table public.custom_reports enable row level security;
alter table public.verification_tokens enable row level security;

create policy "qa demo open access" on public.users for all using (true) with check (true);
create policy "qa demo open access" on public.organizations for all using (true) with check (true);
create policy "qa demo open access" on public.collections for all using (true) with check (true);
create policy "qa demo open access" on public.collection_organizations for all using (true) with check (true);
create policy "qa demo open access" on public.people for all using (true) with check (true);
create policy "qa demo open access" on public.deals for all using (true) with check (true);
create policy "qa demo open access" on public.tasks for all using (true) with check (true);
create policy "qa demo open access" on public.notes for all using (true) with check (true);
create policy "qa demo open access" on public.emails for all using (true) with check (true);
create policy "qa demo open access" on public.activities for all using (true) with check (true);
create policy "qa demo open access" on public.custom_reports for all using (true) with check (true);
create policy "qa demo open access" on public.verification_tokens for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
