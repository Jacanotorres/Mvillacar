/* =========================================================
   MVillacar — configuración del sitio
   El inventario, el equipo y los clientes felices viven en Supabase
   (ver assets/js/db.js) y se administran desde panel.html. Aquí solo
   queda la configuración fija del sitio (contacto, redes) y los
   helpers que usan varias páginas.

   Un dato que se deje vacío ("") simplemente no se muestra en el
   sitio: sus botones, enlaces y bloques se ocultan solos (main.js).
   ========================================================= */

const WHATSAPP_NUMBER = "";        // solo dígitos, con indicativo del país (ej. "573001234567")
const CONTACT_PHONE_DISPLAY = "";  // como se muestra en el sitio (ej. "+57 300 123 4567")
const CONTACT_EMAIL = "";
const CONTACT_ADDRESS = "";
const CONTACT_HOURS = "";          // ej. "Lunes a sábado, 8:00 a.m. – 6:00 p.m."

const SOCIAL_LINKS = {
  instagram: "",
  tiktok: "",
  facebook: "",
  maps: ""                         // enlace de Google Maps de la sede
};

/* Mapa incrustado de la página de contacto. Vacío = no se muestra el mapa. */
const MAP_EMBED_URL = "";

function waLink(message){
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

/* Igual que waLink(), pero a un número específico (por ejemplo, el
   WhatsApp directo de un asesor en particular). */
function waLinkTo(number, message){
  return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
}

function formatPrice(n){
  return "$" + n.toLocaleString("es-CO");
}
function formatKm(n){
  return n.toLocaleString("es-CO") + " km";
}
