-- Luxury pawnshop schema. Run in the Supabase SQL editor or via `supabase db push`.
-- The website talks to Supabase only from the server with the service role key,
-- so RLS is enabled with no public policies (deny-by-default for anon clients).

create table if not exists public.settings (
  id                  int primary key default 1 check (id = 1),
  currency            text    not null default 'KRW',
  gold_price_per_gram numeric not null default 152000,
  gold_pledge_rate    numeric not null default 0.85,
  gold_buyout_rate    numeric not null default 0.92,
  device_pledge_rate  numeric not null default 0.60,
  device_buyout_rate  numeric not null default 0.70,
  monthly_fee_percent numeric not null default 3,
  updated_at          timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.branches (
  id        text primary key,
  name      text not null,
  city      text not null,
  address   text not null,
  hours     text not null default '',
  phone     text not null default '',
  whatsapp  text not null default '',
  lat       double precision not null,
  lng       double precision not null,
  active    boolean not null default true,
  sort      int not null default 0
);

create table if not exists public.offers (
  id          text primary key,
  title       text not null,
  category    text not null check (category in ('gold','watches','smartphones','laptops','tablets','electronics')),
  price       numeric not null,
  condition   text not null default '',
  description text not null default '',
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.valuation_requests (
  id           text primary key,
  created_at   timestamptz not null default now(),
  category     text not null,
  kind         text not null check (kind in ('gold','device')),
  mode         text not null check (mode in ('pledge','buyout')),
  summary      text not null,
  details      jsonb not null default '{}'::jsonb,
  estimate_min numeric not null default 0,
  estimate_max numeric not null default 0,
  name         text not null,
  phone        text not null,
  contact      text not null default 'phone',
  branch_id    text references public.branches(id) on delete set null,
  photos       text[] not null default '{}',
  status       text not null default 'new' check (status in ('new','contacted','done','rejected')),
  note         text
);
create index if not exists valuation_requests_created_idx on public.valuation_requests (created_at desc);

alter table public.settings           enable row level security;
alter table public.branches           enable row level security;
alter table public.offers             enable row level security;
alter table public.valuation_requests enable row level security;

-- Private bucket for customer photos (served to admins via signed URLs).
insert into storage.buckets (id, name, public)
values ('valuation-photos', 'valuation-photos', false)
on conflict (id) do nothing;

-- Demo content (safe to delete).
insert into public.branches (id, name, city, address, hours, phone, whatsapp, lat, lng, sort) values
  ('seoul-gangnam', 'Gangnam Flagship', 'Сеул', 'Seoul, Gangnam-gu, Teheran-ro 152', 'Пн–Сб 10:00–21:00, Вс 11:00–19:00', '+82 2-000-0001', '82200000001', 37.5005, 127.0365, 1),
  ('ansan', 'Ansan Station', 'Ансан', 'Ansan-si, Danwon-gu, Wongok-dong 790', 'Ежедневно 10:00–22:00', '+82 31-000-0002', '82310000002', 37.3311, 126.7889, 2),
  ('incheon', 'Incheon Bupyeong', 'Инчхон', 'Incheon, Bupyeong-gu, Bupyeong-daero 1', 'Пн–Сб 10:00–20:00', '+82 32-000-0003', '82320000003', 37.4894, 126.7245, 3)
on conflict (id) do nothing;
