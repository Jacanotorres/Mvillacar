-- MVillacar publica cada vehículo solo con marca, modelo, año, descripción
-- y precio. Este script agrega la descripción y deja de exigir los datos
-- que ya no se piden en el panel (kilometraje, combustible, color, placa).
-- Ejecutar UNA vez: Dashboard -> SQL Editor -> New query -> pegar -> Run.
--
-- Nota sobre los nombres: en esta tabla la columna "linea" guarda el modelo
-- del carro (ej. "CX-5") y la columna "modelo" guarda el año.

alter table public.vehicles
  add column if not exists descripcion text,
  alter column km drop not null,
  alter column combustible drop not null,
  alter column color drop not null,
  alter column placa drop not null;
