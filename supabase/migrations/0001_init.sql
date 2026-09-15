-- Esquema inicial: apartamentos y reservas, con bloqueo de fechas cruzadas
-- a nivel de base de datos (no solo en el código de la app).

create extension if not exists btree_gist;

create table if not exists apartments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) default auth.uid(),
  name text not null,
  color text not null default '#1C4E80',
  created_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references apartments (id) on delete cascade,
  owner_id uuid not null references auth.users (id) default auth.uid(),
  start_date date not null,
  end_date date not null,
  amount numeric(10, 2),
  created_at timestamptz not null default now(),
  constraint reservations_valid_range check (end_date > start_date),
  -- Impide fechas cruzadas para el mismo apartamento: la base de datos
  -- rechaza el INSERT/UPDATE si el rango se solapa con una reserva existente.
  constraint reservations_no_overlap exclude using gist (
    apartment_id with =,
    daterange(start_date, end_date, '[)') with &&
  )
);

alter table apartments enable row level security;
alter table reservations enable row level security;

create policy "owner reads own apartments"
  on apartments for select
  using (auth.uid() = owner_id);

create policy "owner writes own apartments"
  on apartments for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owner reads own reservations"
  on reservations for select
  using (auth.uid() = owner_id);

create policy "owner writes own reservations"
  on reservations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
