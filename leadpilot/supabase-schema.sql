-- Run this in your Supabase SQL editor

-- Profiles (mirrors auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Configurations
create table public.configurations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  niche text not null,
  price_min integer not null default 0,
  price_max integer not null default 1000,
  location_state text not null,
  location_city text not null,
  location_zip text,
  landing_page_url text not null,
  auto_approve boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.configurations enable row level security;
create policy "Users can manage own config" on public.configurations
  for all using (auth.uid() = user_id);

-- Gmail connections
create table public.gmail_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  gmail_address text not null,
  access_token text not null,
  refresh_token text not null,
  token_expiry timestamptz,
  last_synced_at timestamptz
);
alter table public.gmail_connections enable row level security;
create policy "Users can manage own gmail" on public.gmail_connections
  for all using (auth.uid() = user_id);

-- Leads
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_platform text not null,
  source_email_subject text not null,
  source_email_body text not null,
  lead_title text not null,
  lead_description text not null,
  lead_budget text,
  lead_location text,
  lead_url text,
  status text not null default 'new' check (status in ('new', 'responded', 'skipped', 'expired')),
  created_at timestamptz default now() not null
);
alter table public.leads enable row level security;
create policy "Users can manage own leads" on public.leads
  for all using (auth.uid() = user_id);
create index leads_user_status on public.leads(user_id, status);
create index leads_user_created on public.leads(user_id, created_at desc);

-- Responses
create table public.responses (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  draft_message text not null,
  final_message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'sent')),
  approved_at timestamptz,
  created_at timestamptz default now() not null
);
alter table public.responses enable row level security;
create policy "Users can manage own responses" on public.responses
  for all using (auth.uid() = user_id);
