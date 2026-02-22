-- 1) Nuevas columnas en businesses para mapa y suscripción
alter table public.businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists subscription_months integer not null default 1,
  add column if not exists subscription_started_at timestamptz not null default now();

-- 2) Tabla admin para login de administración
create table if not exists public.admin (
  id bigint generated always as identity primary key,
  clave text not null,
  code text not null,
  created_at timestamptz not null default now()
);

-- Garantiza que solo exista una fila
create unique index if not exists admin_single_row_idx on public.admin ((true));

-- Inserta la fila inicial (solo se crea si no hay ninguna)
insert into public.admin (clave, code)
select 'admin_roa', 'cambia-este-code-seguro'
where not exists (select 1 from public.admin);

-- 3) (Opcional) vista para ver fecha de vencimiento
create or replace view public.businesses_with_expiration as
select
  b.*,
  (b.subscription_started_at + (b.subscription_months || ' months')::interval) as subscription_expires_at
from public.businesses b;
