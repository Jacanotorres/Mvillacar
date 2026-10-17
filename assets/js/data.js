/* =========================================================
   MVillacar — configuración del sitio
   El inventario, el equipo y los clientes felices viven en Supabase
   (ver assets/js/db.js) y se administran desde panel.html. Aquí solo
   queda la configuración fija del sitio (contacto, redes) y los
   helpers que usan varias páginas.

   Un dato que se deje vacío ("") simplemente no se muestra en el
   sitio: sus botones, enlaces y bloques se ocultan solos (main.js).
   ========================================================= */

const WHATSAPP_NUMBER = "573186651831";             // solo dígitos, con indicativo del país
const CONTACT_PHONE_DISPLAY = "+57 318 665 1831";  // como se muestra en el sitio
const CONTACT_EMAIL = "";
const CONTACT_ADDRESS = "";
const CONTACT_HOURS = "Lunes a viernes, 8:00 a.m. – 6:00 p.m. · Sábados, 8:00 a.m. – 3:30 p.m.";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/mvillacaroficial/",
  tiktok: "https://www.tiktok.com/@mvillacaroficial",
  facebook: "https://www.facebook.com/MVillacaroficial/",
  maps: ""                         // enlace de Google Maps de la sede
};

/* Mapa incrustado de la página de contacto. Vacío = no se muestra el mapa. */
const MAP_EMBED_URL = "";

/* Clientes felices fijos (entregas reales de MVillacar), en assets/img/clientes/.
   Se muestran después de los que se suban desde el panel. */
const HAPPY_CLIENTS_FIJOS = [
  "assets/img/clientes/cliente-1.webp",
  "assets/img/clientes/cliente-2.webp",
  "assets/img/clientes/cliente-3.webp",
  "assets/img/clientes/cliente-4.webp"
];

/* Parámetros del simulador de financiación (financiacion.html).
   OJO: la tasa es un valor de referencia; confirmarla con MVillacar. */
const FINANCE_RATE_EA = 0.22;                    /* tasa efectiva anual (22 %) */
const FINANCE_TERMS = [12, 24, 36, 48, 60, 72];  /* plazos en meses */
const FINANCE_MAX_INITIAL = 70;                  /* cuota inicial máxima (% del valor) */

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

/* Logos de marca (assets/img/marcas/, en blanco). Se busca por el nombre de la
   marca sin tildes, espacios ni guiones ("Mercedes-Benz" -> "mercedesbenz").
   Para agregar una marca nueva: guarda su logo en esa carpeta y súmalo aquí.
   Las marcas sin logo se muestran con un emblema de sus iniciales. */
const BRAND_LOGO_FILES = ["acura.svg", "alfaromeo.svg", "astonmartin.svg", "audi.svg", "bentley.svg", "bmw.svg", "byd.png", "cadillac.svg", "chevrolet.svg", "citroen.svg", "dacia.svg", "ferrari.svg", "fiat.svg", "ford.svg", "honda.svg", "hyundai.svg", "infiniti.svg", "jaguar.svg", "jeep.svg", "kia.svg", "lamborghini.svg", "landrover.svg", "mahindra.svg", "maserati.svg", "mazda.svg", "mclaren.svg", "mercedes.svg", "mg.svg", "mini.svg", "mitsubishi.svg", "nissan.svg", "opel.svg", "peugeot.svg", "polestar.svg", "porsche.svg", "ram.svg", "renault.svg", "rollsroyce.svg", "seat.svg", "skoda.svg", "smart.svg", "subaru.svg", "suzuki.svg", "tata.svg", "tesla.svg", "toyota.svg", "vauxhall.svg", "volkswagen.svg", "volvo.svg"];
const BRAND_ALIASES = {
  mercedesbenz: "mercedes", mercedes: "mercedes", vw: "volkswagen", chevy: "chevrolet",
  rangerover: "landrover", ssangyong: "ssangyong", kiamotors: "kia", alfa: "alfaromeo"
};
function brandKey(marca){
  return String(marca).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
function brandLogoUrl(marca){
  const key = brandKey(marca);
  const slug = BRAND_ALIASES[key] || key;
  const file = BRAND_LOGO_FILES.find(function(f){ return f.split(".")[0] === slug; });
  return file ? "assets/img/marcas/" + file : "";
}
