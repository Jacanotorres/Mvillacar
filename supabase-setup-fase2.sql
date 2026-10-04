-- ============================================================
-- FASE 2: Usuarios con roles (Admin / Asesor) + inventario, equipo
-- y clientes felices administrables desde Supabase.
--
-- Ejecutar UNA VEZ en Supabase: Dashboard -> SQL Editor -> New query
-- -> pegar todo este archivo -> Run.
--
-- Después de correr esto, se suben las fotos existentes a Storage
-- (yo lo hago con un script), luego se corre "supabase-setup-fase2-datos.sql"
-- con los datos, y al final "supabase-setup-fase2-cerrar-storage.sql"
-- para cerrar el permiso temporal de subida de fotos.
-- ============================================================

-- 1. Perfiles: extiende auth.users con el rol de cada usuario.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','asesor')),
  nombre text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Cada usuario ve su propio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- Función helper: rol del usuario autenticado actual (o null si no tiene perfil).
-- "security definer" para poder leer profiles sin quedar atrapada en su propia RLS.
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 2. Vehículos (reemplaza el arreglo VEHICLES de assets/js/data.js).
create table public.vehicles (
  id text primary key,
  marca text not null,
  linea text not null,
  version text,
  modelo int not null,
  precio bigint not null,
  precio_anterior bigint,
  km int not null,
  combustible text not null,
  color text not null,
  cilindraje text,
  placa text unique not null,
  soat_vence text,
  tecno_vence text,
  destacado boolean not null default false,
  oportunidad boolean not null default false,
  fecha_ingreso date,
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Cualquiera puede ver el inventario"
  on public.vehicles for select
  to anon, authenticated
  using (true);

create policy "Admin y asesor administran el inventario"
  on public.vehicles for all
  to authenticated
  using (get_my_role() in ('admin','asesor'))
  with check (get_my_role() in ('admin','asesor'));

-- 3. Fotos de vehículos (una fila por foto, con su orden de galería).
create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  url text not null,
  posicion int not null default 0
);

alter table public.vehicle_photos enable row level security;

create policy "Cualquiera puede ver las fotos de vehiculos"
  on public.vehicle_photos for select
  to anon, authenticated
  using (true);

create policy "Admin y asesor administran fotos de vehiculos"
  on public.vehicle_photos for all
  to authenticated
  using (get_my_role() in ('admin','asesor'))
  with check (get_my_role() in ('admin','asesor'));

-- 4. Equipo (asesores que se muestran en el sitio).
create table public.team (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text not null,
  whatsapp text not null,
  foto text,
  orden int not null default 0
);

alter table public.team enable row level security;

create policy "Cualquiera puede ver el equipo"
  on public.team for select
  to anon, authenticated
  using (true);

create policy "Solo admin administra el equipo"
  on public.team for all
  to authenticated
  using (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');

-- 5. Clientes felices.
create table public.happy_clients (
  id uuid primary key default gen_random_uuid(),
  foto text not null,
  orden int not null default 0
);

alter table public.happy_clients enable row level security;

create policy "Cualquiera puede ver los clientes felices"
  on public.happy_clients for select
  to anon, authenticated
  using (true);

create policy "Solo admin administra clientes felices"
  on public.happy_clients for all
  to authenticated
  using (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');

-- 6. Buckets de Storage para las fotos (públicos para lectura).
insert into storage.buckets (id, name, public)
values ('vehiculos', 'vehiculos', true),
       ('equipo', 'equipo', true),
       ('clientes', 'clientes', true)
on conflict (id) do nothing;

create policy "Lectura publica fotos vehiculos"
  on storage.objects for select
  to public
  using (bucket_id = 'vehiculos');

create policy "Lectura publica fotos equipo"
  on storage.objects for select
  to public
  using (bucket_id = 'equipo');

create policy "Lectura publica fotos clientes"
  on storage.objects for select
  to public
  using (bucket_id = 'clientes');

-- TEMPORAL: deja subir fotos con la llave pública SOLO para poder migrar
-- las ~260 fotos que ya existen en el sitio. Se reemplaza por la política
-- definitiva (solo admin/asesor logueados) al correr
-- "supabase-setup-fase2-cerrar-storage.sql" cuando la migración termine.
create policy "TEMP subida publica de fotos para migracion"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id in ('vehiculos','equipo','clientes'));
