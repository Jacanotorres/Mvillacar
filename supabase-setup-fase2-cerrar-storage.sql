-- Ejecutar DESPUÉS de que las fotos ya estén subidas y el archivo
-- supabase-setup-fase2-datos.sql ya se haya corrido.
-- Esto cierra el hueco de seguridad temporal: a partir de aquí, solo
-- un Admin o Asesor con sesión iniciada puede subir/editar/borrar fotos.

drop policy "TEMP subida publica de fotos para migracion" on storage.objects;

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
