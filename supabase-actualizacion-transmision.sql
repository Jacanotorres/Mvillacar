-- MVillacar — transmisión de los vehículos (2026-10)
-- Ejecutar UNA vez en el proyecto de MVillacar (en la dirección del
-- navegador debe aparecer fpmslcgvqbdlhwlqyzsk):
-- SQL Editor -> New query -> pegar todo -> Run.
--
-- Cilindraje y combustible ya existían en la tabla; solo falta la transmisión.
alter table public.vehicles
  add column if not exists transmision text;
