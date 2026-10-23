-- MVillacar — campos nuevos (2026-10)
-- Ejecutar UNA vez: Supabase -> SQL Editor -> New query -> pegar todo -> Run.
-- Debe decir "Success. No rows returned".
--
-- 1. Vehículos: último dígito de la placa (solo ese número, no la placa
--    completa). Kilometraje, color, SOAT y tecnomecánica ya existían en la
--    tabla: el SOAT y la tecno se guardan como fecha "AAAA-MM-DD".
alter table public.vehicles
  add column if not exists placa_digito text;

-- 2. Formulario "Vende tu carro": transmisión y color.
alter table public.vende_tu_carro
  add column if not exists transmision text,
  add column if not exists color text;
