/* Conexión con Supabase. La "llave pública" es segura de exponer aquí:
   solo permite insertar filas (ver políticas de seguridad en supabase-setup.sql),
   no leer, editar ni borrar datos.

   MVillacar necesita su PROPIO proyecto de Supabase (nunca la URL/llave de
   otro cliente: sus formularios e inventario terminarían en esa base).
   Mientras estas dos constantes estén vacías, el sitio funciona sin base de
   datos: el inventario y las demás secciones dinámicas simplemente se ocultan. */
const SUPABASE_URL = "https://fpmslcgvqbdlhwlqyzsk.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_k5ATvOE-emm81Q73-wrN3Q_7epojgUO";

const supabaseClient = (SUPABASE_URL && SUPABASE_PUBLIC_KEY)
  ? supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
  : null;
