-- Ejecutar esto una sola vez en Supabase: Dashboard -> SQL Editor -> New query -> pegar y correr (RUN)

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
