-- ============================================================
-- CHATBOT DE WHATSAPP: memoria de las conversaciones.
--
-- Ejecutar UNA VEZ en Supabase: Dashboard -> SQL Editor -> New query
-- -> pegar todo este archivo -> Run.
--
-- Estas tablas las usa solo la Edge Function "whatsapp-bot" (con la
-- llave de servicio, que se salta la seguridad por filas). Por eso NO
-- hay ninguna política para la llave pública: desde la web nadie puede
-- leer ni escribir aquí. Admin y asesor sí pueden ver las conversaciones
-- desde el panel / Table Editor.
-- ============================================================

-- 1. Una fila por cliente (identificado por su número de WhatsApp).
create table public.whatsapp_conversations (
  wa_id text primary key,              -- número con indicativo, ej. 573001234567
  nombre text,                         -- nombre del perfil de WhatsApp
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.whatsapp_conversations enable row level security;

create policy "Admin y asesor ven las conversaciones del bot"
  on public.whatsapp_conversations for select
  to authenticated
  using (get_my_role() in ('admin','asesor'));

-- 2. Historial de mensajes (lo que el bot recuerda de cada cliente).
create table public.whatsapp_messages (
  id bigint generated always as identity primary key,
  wa_id text not null references public.whatsapp_conversations(wa_id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  wa_message_id text unique,           -- id del mensaje en WhatsApp; evita procesar dos veces el mismo
  created_at timestamptz not null default now()
);

create index whatsapp_messages_wa_id_created_idx
  on public.whatsapp_messages (wa_id, created_at desc);

alter table public.whatsapp_messages enable row level security;

create policy "Admin y asesor ven los mensajes del bot"
  on public.whatsapp_messages for select
  to authenticated
  using (get_my_role() in ('admin','asesor'));
