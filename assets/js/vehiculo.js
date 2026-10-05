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

  const waText = "Hola, quiero más información del " + v.marca + " " + v.linea + " " + v.modelo;
  const contactHTML = WHATSAPP_NUMBER
    ? '<p class="veh-cta-line">¿Te interesa este vehículo? Escríbenos ahora.</p>' +
      '<a class="btn btn-green" href="' + waLink(waText) + '" target="_blank" rel="noopener">Hablar por WhatsApp</a>' +
      '<a class="btn btn-ghost" href="' + waLink("Hola, quiero programar una visita para ver el " + v.marca + " " + v.linea + " " + v.modelo) + '" target="_blank" rel="noopener">Programar visita</a>' +
      '<p style="margin-top:16px;margin-bottom:0;font-size:13.5px;">Uno de nuestros asesores puede darte más información, enviarte fotos adicionales o ayudarte a programar una visita.</p>'
    : '<a class="btn btn-primary" href="contacto.html">Contáctanos</a>';

  root.innerHTML =
    '<div class="veh-detail">' +
      '<div>' +
        galleryHTML +

        (v.descripcion
          ? '<div style="margin-top:44px;">' +
              '<h2 style="font-size:26px;margin-bottom:16px;">Descripción</h2>' +
              '<p class="veh-desc" id="veh-desc"></p>' +
            '</div>'
          : "") +

        '<div style="margin-top:44px;">' +
          '<h2 style="font-size:26px;margin-bottom:16px;">Información del vehículo</h2>' +
          '<table class="spec-table">' +
            specRow("Marca", v.marca) +
            specRow("Modelo", v.linea) +
            specRow("Año", v.modelo) +
          '</table>' +
        '</div>' +
      '</div>' +

      '<aside class="veh-sidebar">' +
        '<h1 style="font-size:26px;margin-bottom:4px;">' + v.marca + ' ' + v.linea + '</h1>' +
        '<div class="veh-quick-specs"><span>' + v.modelo + '</span></div>' +
        '<div class="veh-price-wrap"><span class="veh-price">' + formatPrice(v.precio) + '</span></div>' +
        (WHATSAPP_NUMBER
          ? '<p style="margin:-8px 0 20px;"><a class="link-arrow" href="' + waLink("Hola, quiero información sobre financiación para el " + v.marca + " " + v.linea + " " + v.modelo) + '" target="_blank" rel="noopener">¿Necesitas financiación? Pregúntanos →</a></p>'
          : "") +
        contactHTML +
      '</aside>' +
    '</div>';

  /* La descripción es texto libre del panel: se pone como texto, no como HTML */
  const desc = document.getElementById("veh-desc");
  if(desc) desc.textContent = v.descripcion;

  if(fotos.length > 1){
    const mainPhoto = document.getElementById("veh-main-photo");
    root.querySelectorAll(".veh-gallery-thumbs div").forEach(function(thumb){
      thumb.addEventListener("click", function(){
        mainPhoto.src = thumb.getAttribute("data-src");
        root.querySelectorAll(".veh-gallery-thumbs div").forEach(function(t){ t.classList.remove("active"); });
        thumb.classList.add("active");
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", renderVehicleDetail);
