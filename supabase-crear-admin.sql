-- Asigna el rol de Admin a la cuenta del administrador
-- Correr en el SQL Editor (Dashboard -> SQL Editor -> New query -> Run).
-- Funciona tanto si la fila ya existe (la actualiza) como si no (la crea).

insert into public.profiles (id, role, nombre)
values ('PEGAR-AQUI-EL-ID-DEL-USUARIO', 'admin', 'Administración')
on conflict (id) do update set role = excluded.role, nombre = excluded.nombre;
