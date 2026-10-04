-- Galería del concesionario: fotos y videos de la página "Nosotros",
-- administrados desde la pestaña "Galería" del panel (solo Admin).
-- Ejecutar UNA vez: Dashboard -> SQL Editor -> New query -> pegar -> Run.

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
