-- MVillacar — convertir un usuario en Administrador
--
-- Correr DESPUÉS de supabase-instalar.sql:
--   1. En Supabase: menú "Authentication" -> "Users" -> "Add user"
--      -> "Create new user". Pon el correo y la contraseña con que
--      vas a entrar al panel y marca "Auto Confirm User".
--   2. En esa lista, copia el "User UID" del usuario recién creado.
--   3. Reemplaza abajo PEGAR-AQUI-EL-ID-DEL-USUARIO por ese UID
--      (deja las comillas sencillas).
--   4. "SQL Editor" -> "New query" -> pega esto -> "Run".
-- Funciona tanto si la fila ya existe (la actualiza) como si no (la crea).

insert into public.profiles (id, role, nombre)
values ('PEGAR-AQUI-EL-ID-DEL-USUARIO', 'admin', 'Administración')
on conflict (id) do update set role = excluded.role, nombre = excluded.nombre;
