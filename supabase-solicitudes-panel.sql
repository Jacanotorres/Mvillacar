-- MVillacar — ver en el panel las solicitudes de "Vende tu carro" (2026-11)
-- Ejecutar UNA vez en el proyecto de MVillacar (en la dirección del
-- navegador debe aparecer fpmslcgvqbdlhwlqyzsk):
-- SQL Editor -> New query -> pegar todo -> Run.
--
-- Hasta ahora la tabla solo permitía ENVIAR el formulario; nadie podía
-- leerla desde el sitio. Con esto:
--   - Admin y asesor (con sesión iniciada) pueden ver las solicitudes.
--   - Solo Admin puede borrarlas.
--   - El formulario también funciona si quien lo llena tiene sesión
--     abierta (por ejemplo, al probarlo desde el panel).
-- Los visitantes siguen sin poder leer nada.

create policy "Admin y asesor ven las solicitudes de venta"
  on public.vende_tu_carro for select
  to authenticated
  using (get_my_role() in ('admin','asesor'));

create policy "Solo admin borra solicitudes de venta"
  on public.vende_tu_carro for delete
  to authenticated
  using (get_my_role() = 'admin');

create policy "Usuarios con sesion tambien pueden enviar el formulario"
  on public.vende_tu_carro for insert
  to authenticated
  with check (true);
