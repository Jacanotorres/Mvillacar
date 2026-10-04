/* =========================================================
   MVillacar — comportamiento compartido del sitio
   ========================================================= */

document.addEventListener("DOMContentLoaded", function(){

  /* Menú móvil */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("nav.main-nav");
  const scrim = document.querySelector(".nav-scrim");
  if(toggle && nav && scrim){
    function closeNav(){
      nav.classList.remove("open");
      scrim.classList.remove("open");
      toggle.setAttribute("aria-expanded","false");
    }
    toggle.addEventListener("click", function(){
      const isOpen = nav.classList.toggle("open");
      scrim.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    scrim.addEventListener("click", closeNav);
    nav.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", closeNav); });
  }

  /* Enlaces de WhatsApp con texto predefinido (data-wa-text). Sin número
     configurado se ocultan, igual que los textos que hablan de WhatsApp
     (data-wa-only). */
  document.querySelectorAll("[data-wa-text]").forEach(function(a){
    if(WHATSAPP_NUMBER) a.href = waLink(a.getAttribute("data-wa-text"));
    else a.hidden = true;
  });
  if(!WHATSAPP_NUMBER){
    document.querySelectorAll("[data-wa-only]").forEach(function(el){ el.hidden = true; });
  }

  /* Enlaces a redes sociales / mapa (data-social="instagram|tiktok|facebook|maps").
     Los que no tienen enlace se ocultan junto con su tarjeta o ítem de lista. */
  document.querySelectorAll("[data-social]").forEach(function(a){
    const url = SOCIAL_LINKS[a.getAttribute("data-social")];
    if(url) a.href = url;
    else (a.closest(".social-card, li") || a).hidden = true;
  });

  /* Datos de contacto: data-contact="phone|email|address|hours" pone el
     texto y data-contact-href="phone|email" arma el enlace tel:/mailto:. */
  const contactText = {
    phone: CONTACT_PHONE_DISPLAY, email: CONTACT_EMAIL,
    address: CONTACT_ADDRESS, hours: CONTACT_HOURS
  };
  const contactHref = {
    phone: WHATSAPP_NUMBER ? "tel:+" + WHATSAPP_NUMBER : "",
    email: CONTACT_EMAIL ? "mailto:" + CONTACT_EMAIL : ""
  };
  document.querySelectorAll("[data-contact]").forEach(function(el){
    const text = contactText[el.getAttribute("data-contact")];
    if(text) el.textContent = text;
    else el.hidden = true;
  });
  document.querySelectorAll("[data-contact-href]").forEach(function(el){
    const href = contactHref[el.getAttribute("data-contact-href")];
    if(href) el.href = href;
    else el.hidden = true;
  });

  /* Bloques que solo tienen sentido si les quedó algún dato visible
     (data-hide-if-empty). Si el atributo trae el id de otro elemento,
     ese se muestra en su lugar. */
  document.querySelectorAll("[data-hide-if-empty]").forEach(function(box){
    const items = Array.from(box.querySelectorAll("[data-wa-text],[data-social],[data-contact]"));
    if(items.some(function(el){ return !el.closest("[hidden]"); })) return;
    box.hidden = true;
    const fallback = document.getElementById(box.getAttribute("data-hide-if-empty"));
    if(fallback) fallback.hidden = false;
  });

  /* Mapa incrustado (iframe data-map-embed) */
  document.querySelectorAll("[data-map-embed]").forEach(function(frame){
    if(MAP_EMBED_URL) frame.src = MAP_EMBED_URL;
    else frame.closest(".map-frame").hidden = true;
  });

  /* Año dinámico en el footer */
  document.querySelectorAll("[data-year]").forEach(function(el){
    el.textContent = new Date().getFullYear();
  });

  /* Botón "Panel" del header: viene oculto y solo se muestra cuando hay
     una sesión abierta. Se protege con typeof por si la página no cargó
     el cliente de Supabase. */
  const authLink = document.getElementById("header-auth-link");
  if(authLink && typeof supabaseClient !== "undefined" && supabaseClient){
    supabaseClient.auth.getSession().then(function(res){
      if(res.data.session){
        authLink.hidden = false;
        document.body.classList.add("logged-in");
      }
    });
  }

  /* Acordeón de preguntas frecuentes */
  document.querySelectorAll(".faq-item .faq-q").forEach(function(btn){
    btn.addEventListener("click", function(){
      const item = btn.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".faq-item").forEach(function(i){ i.classList.remove("open"); });
      if(!wasOpen) item.classList.add("open");
    });
  });

});

/* Genera el grid de fotos de "clientes felices" a partir de HAPPY_CLIENTS.
   Si un cliente no tiene "foto" todavía, se muestra un ícono de marcador. */
function renderClientPhotos(list){
  return list.map(function(c){
    const inner = c.foto
      ? '<img src="' + c.foto + '" alt="Cliente feliz con su vehículo" style="width:100%;height:100%;object-fit:cover;display:block;">'
      : photoIconSVG();
    return '<div class="team-photo">' + inner + '</div>';
  }).join("");
}

/* Para las secciones que se llenan desde Supabase (clientes, equipo,
   recién llegados...): si no hay nada que mostrar, se oculta la sección
   completa en vez de dejar el título con un espacio vacío. */
function fillOrHideSection(container, html){
  if(!container) return;
  if(html) container.innerHTML = html;
  else container.closest("section").hidden = true;
}

/* Icono de cámara reutilizable para fotos de clientes sin imagen aún */
function photoIconSVG(){
  return '<svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="4" y="10" width="40" height="26" rx="4" stroke="#6B6B6B" stroke-width="2.2"/>' +
    '<path d="M16 10L19 5H29L32 10" stroke="#6B6B6B" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<circle cx="24" cy="23" r="7" stroke="#6B6B6B" stroke-width="2.2"/>' +
    '</svg>';
}

/* Icono de auto reutilizable para fotos placeholder */
function carIconSVG(){
  return '<svg viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6 26L10 14C11 11 13 9 16 9H42C45 9 47.5 11 48.5 14L52 26" stroke="#6B6B6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M3 26H55C56.5 26 57.5 27.2 57.5 28.5V32C57.5 33.5 56.3 34.5 55 34.5H49" stroke="#6B6B6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M3 26V32C3 33.5 4.2 34.5 5.5 34.5H9" stroke="#6B6B6B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="9" y1="34.5" x2="49" y2="34.5" stroke="#6B6B6B" stroke-width="2.5" stroke-linecap="round"/>' +
    '<circle cx="16" cy="34.5" r="5" fill="#FAFAF8" stroke="#6B6B6B" stroke-width="2.5"/>' +
    '<circle cx="44" cy="34.5" r="5" fill="#FAFAF8" stroke="#6B6B6B" stroke-width="2.5"/>' +
    '<line x1="18" y1="18" x2="18" y2="26" stroke="#6B6B6B" stroke-width="2"/>' +
    '<line x1="34" y1="18" x2="34" y2="26" stroke="#6B6B6B" stroke-width="2"/>' +
    '</svg>';
}
