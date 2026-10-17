/* =========================================================
   MVillacar — ficha individual de vehículo
   ========================================================= */

function specRow(label, value){
  if(value === undefined || value === null || value === "") return "";
  return "<tr><td>" + label + "</td><td>" + value + "</td></tr>";
}

async function renderVehicleDetail(){
  const root = document.getElementById("vehicle-detail");
  if(!root) return;

  root.innerHTML = '<div class="empty-state">Cargando vehículo...</div>';

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const v = id ? await fetchVehicleById(id) : null;

  if(!v){
    root.innerHTML =
      '<div class="empty-state">' +
        '<h2 style="margin-bottom:10px;">No encontramos este vehículo</h2>' +
        '<p style="margin-bottom:20px;">Puede que ya no esté disponible. Explora el resto de nuestro inventario.</p>' +
        '<a class="btn btn-primary" href="inventario.html">Ver inventario</a>' +
      '</div>';
    return;
  }

  document.title = v.marca + " " + v.linea + " " + v.modelo + " — MVillacar";

  const fotos = v.fotos || [];
  const galleryHTML = fotos.length > 0
    ? '<div class="veh-gallery-main"><img id="veh-main-photo" src="' + fotos[0] + '" alt="' + v.marca + ' ' + v.linea + '"></div>' +
      (fotos.length > 1
        ? '<div class="veh-gallery-thumbs">' + fotos.map(function(src, i){
            return '<div class="' + (i === 0 ? "active" : "") + '" data-src="' + src + '"><img src="' + src + '" alt="' + v.marca + ' ' + v.linea + ' foto ' + (i + 1) + '" loading="lazy"></div>';
          }).join("") + '</div>'
        : "")
    : '<div class="veh-gallery-main">' + carIconSVG() + '</div>';

  const nombre = v.marca + " " + v.linea + " " + v.modelo;
  const waText = "Hola, quiero más información del " + nombre;
  const contactHTML = WHATSAPP_NUMBER
    ? '<p class="veh-cta-line">¿Te interesa este vehículo? Escríbenos ahora.</p>' +
      '<a class="btn btn-green" href="' + waLink(waText) + '" target="_blank" rel="noopener">Hablar por WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + waLink("Hola, quiero programar una visita para ver el " + nombre) + '" target="_blank" rel="noopener">Programar visita</a>'
    : '<a class="btn btn-primary" href="contacto.html">Contáctanos</a>';
  const financeHTML = '<a class="btn btn-ghost" href="financiacion.html?vehiculo=' + encodeURIComponent(v.id) + '">Simular financiación</a>';

  /* Título, año y precio: en escritorio van en la columna lateral; en
     celular se muestran debajo de las fotos (veh-mobile-summary). */
  const summaryHTML =
    '<div class="veh-quick-specs"><span>' + v.modelo + '</span></div>' +
    '<div class="veh-price-wrap"><span class="veh-price">' + formatPrice(v.precio) + '</span></div>';

  root.innerHTML =
    '<div class="veh-detail">' +
      '<div>' +
        galleryHTML +

        '<div class="veh-mobile-summary">' +
          '<p class="veh-mobile-title">' + v.marca + ' ' + v.linea + '</p>' +
          summaryHTML +
        '</div>' +

        (v.descripcion
          ? '<div class="veh-block">' +
              '<h2>Descripción</h2>' +
              '<p class="veh-desc" id="veh-desc"></p>' +
            '</div>'
          : "") +

        '<div class="veh-block">' +
          '<h2>Información del vehículo</h2>' +
          '<table class="spec-table">' +
            specRow("Marca", v.marca) +
            specRow("Modelo", v.linea) +
            specRow("Año", v.modelo) +
          '</table>' +
        '</div>' +
      '</div>' +

      '<aside class="veh-sidebar">' +
        '<h1>' + v.marca + ' ' + v.linea + '</h1>' +
        summaryHTML +
        contactHTML +
        financeHTML +
        '<p class="veh-sidebar-note">Uno de nuestros asesores puede darte más información, enviarte fotos adicionales o ayudarte a programar una visita.</p>' +
      '</aside>' +
    '</div>';

  /* La descripción es texto libre del panel: se pone como texto, no como HTML */
  const desc = document.getElementById("veh-desc");
  if(desc) desc.textContent = v.descripcion;

  if(fotos.length > 1){
    const mainPhoto = document.getElementById("veh-main-photo");
    const thumbs = Array.from(root.querySelectorAll(".veh-gallery-thumbs div"));
    let current = 0;

    function goTo(i){
      current = (i + fotos.length) % fotos.length;
      mainPhoto.src = fotos[current];
      thumbs.forEach(function(t, idx){ t.classList.toggle("active", idx === current); });
      thumbs[current].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }

    thumbs.forEach(function(thumb, idx){
      thumb.addEventListener("click", function(){ goTo(idx); });
    });

    /* En celular: deslizar la foto principal a izquierda o derecha */
    const stage = root.querySelector(".veh-gallery-main");
    let startX = null;
    stage.addEventListener("touchstart", function(e){ startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function(e){
      if(startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if(Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    });
  }

  /* Barra fija abajo en celular: precio + WhatsApp siempre a la mano */
  if(WHATSAPP_NUMBER){
    const sticky = document.createElement("div");
    sticky.className = "veh-sticky-cta";
    sticky.innerHTML =
      '<div class="veh-sticky-price"><small>' + v.marca + ' ' + v.linea + '</small><strong>' + formatPrice(v.precio) + '</strong></div>' +
      '<a class="btn btn-green" href="' + waLink(waText) + '" target="_blank" rel="noopener">WhatsApp</a>';
    document.body.appendChild(sticky);
    document.body.classList.add("has-sticky-cta");
  }
}

document.addEventListener("DOMContentLoaded", renderVehicleDetail);
