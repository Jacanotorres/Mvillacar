-- ============================================================
-- MVillacar — instalación completa de la base de datos
--
-- Cómo usarlo (UNA sola vez):
--   1. Entra a supabase.com y abre el proyecto de MVillacar.
--   2. Menú de la izquierda -> "SQL Editor" -> "New query".
--   3. Copia TODO este archivo, pégalo y presiona "Run".
--   4. Debe decir "Success. No rows returned".
--
-- Crea: el formulario de "Vende tu carro", los usuarios con rol
-- (Admin / Asesor), el inventario con sus fotos, el equipo, los
-- clientes felices y la galería, con sus permisos de seguridad.
-- Después falta crear el usuario administrador
-- (ver supabase-crear-admin.sql).
-- ============================================================

-- 0. Formulario "Vende tu carro"
create table public.vende_tu_carro (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  celular text not null,
  marca text not null,
  linea text not null,
  modelo integer,
  kilometraje integer,
  placa text,
  ciudad text not null,
  precio_esperado text
);

-- Seguridad: cualquier persona puede INSERTAR (enviar el formulario),
-- pero nadie puede leer, editar ni borrar datos usando la llave pública.
-- Tú sí puedes ver todo desde el Table Editor de Supabase (usas tu propia sesión).
alter table public.vende_tu_carro enable row level security;

create policy "Cualquiera puede enviar el formulario"
  on public.vende_tu_carro
  for insert
  to anon
  with check (true);

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

-- 2. Vehículos. MVillacar publica cada carro con marca, modelo, año,
--    descripción y precio. OJO: la columna "linea" guarda el modelo
--    (ej. "Serie 3") y la columna "modelo" guarda el año.
create table public.vehicles (
  id text primary key,
  marca text not null,
  linea text not null,
  version text,
  modelo int not null,
  precio bigint not null,
  precio_anterior bigint,
  km int,
  combustible text,
  color text,
  cilindraje text,
  placa text unique,
  descripcion text,
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

-- 7. Permisos de subida: solo Admin o Asesor con sesión iniciada.
create policy "Admin y asesor suben fotos de vehiculos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehiculos' and get_my_role() in ('admin','asesor'));

create policy "Admin y asesor actualizan fotos de vehiculos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vehiculos' and get_my_role() in ('admin','asesor'));

create policy "Admin y asesor borran fotos de vehiculos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehiculos' and get_my_role() in ('admin','asesor'));

create policy "Solo admin sube fotos de equipo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'equipo' and get_my_role() = 'admin');

create policy "Solo admin actualiza fotos de equipo"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'equipo' and get_my_role() = 'admin');

create policy "Solo admin borra fotos de equipo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'equipo' and get_my_role() = 'admin');

create policy "Solo admin sube fotos de clientes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'clientes' and get_my_role() = 'admin');

create policy "Solo admin actualiza fotos de clientes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'clientes' and get_my_role() = 'admin');

create policy "Solo admin borra fotos de clientes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'clientes' and get_my_role() = 'admin');

-- 8. Galería del concesionario (página "Nosotros"): fotos y videos,
--    administrados desde la pestaña "Galería" del panel (solo Admin).
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  tipo text not null check (tipo in ('foto','video')),
  orden int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.gallery enable row level security;

create policy "Cualquiera puede ver la galeria"
  on public.gallery for select
  to anon, authenticated
  using (true);

create policy "Solo admin administra la galeria"
  on public.gallery for all
  to authenticated
  using (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');

-- Archivos: lectura pública; solo fotos y videos de hasta 50 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('galeria', 'galeria', true, 52428800, array['image/*','video/*'])
on conflict (id) do nothing;

create policy "Lectura publica galeria"
  on storage.objects for select
  to public
  using (bucket_id = 'galeria');

create policy "Solo admin sube a la galeria"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'galeria' and get_my_role() = 'admin');

create policy "Solo admin actualiza la galeria"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'galeria' and get_my_role() = 'admin');

create policy "Solo admin borra de la galeria"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'galeria' and get_my_role() = 'admin');
