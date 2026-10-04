/* =========================================================
   MVillacar — catálogo: tarjetas, filtros, orden
   ========================================================= */

function renderVehicleCard(v){
  const photo = (v.fotos && v.fotos[0])
    ? '<img src="' + v.fotos[0] + '" alt="' + v.marca + ' ' + v.linea + '" loading="lazy">'
    : carIconSVG();
  return (
    '<a class="vehicle-card" href="vehiculo.html?id=' + v.id + '">' +
      '<div class="vehicle-photo">' + photo + '</div>' +
      '<div class="vehicle-body">' +
        '<h3>' + v.marca + ' ' + v.linea + '</h3>' +
        '<div class="vehicle-specs"><span>' + v.modelo + '</span></div>' +
        '<p class="price">' + formatPrice(v.precio) + '</p>' +
        '<div class="vehicle-actions">' +
          '<span class="btn btn-primary btn-sm" style="pointer-events:none;">Ver vehículo</span>' +
        '</div>' +
      '</div>' +
    '</a>'
  );
}

function renderGrid(container, vehicles){
  if(!container) return;
  if(vehicles.length === 0){
    container.innerHTML = '<div class="empty-state">No encontramos vehículos con esos filtros. Intenta ajustarlos o escríbenos por WhatsApp y te ayudamos a buscar.</div>';
    return;
  }
  container.innerHTML = vehicles.map(renderVehicleCard).join("");
}

function uniqueSorted(list){
  return Array.from(new Set(list)).sort(function(a,b){ return String(a).localeCompare(String(b), "es"); });
}

function fillSelect(select, values, placeholder){
  if(!select) return;
  select.innerHTML = '<option value="">' + placeholder + '</option>' +
    values.map(function(v){ return '<option value="' + v + '">' + v + '</option>'; }).join("");
}

/* ---------- Página de inventario ---------- */
async function initInventoryPage(){
  const grid = document.getElementById("vehicle-grid");
  if(!grid) return;

  grid.innerHTML = '<div class="empty-state">Cargando inventario...</div>';
  const disponibles = await fetchVehicles();

  const els = {
    marca: document.getElementById("f-marca"),
    linea: document.getElementById("f-linea"),
    anio: document.getElementById("f-anio"),
    precioMin: document.getElementById("f-precio-min"),
    precioMax: document.getElementById("f-precio-max"),
    sort: document.getElementById("f-sort"),
    reset: document.getElementById("f-reset"),
    count: document.getElementById("results-count")
  };

  fillSelect(els.marca, uniqueSorted(disponibles.map(function(v){ return v.marca; })), "Todas las marcas");

  function currentFilters(){
    return {
      marca: els.marca.value,
      linea: (els.linea.value || "").trim().toLowerCase(),
      anio: els.anio.value,
      precioMin: parseFloat(els.precioMin.value) || null,
      precioMax: parseFloat(els.precioMax.value) || null
    };
  }

  function applyFilters(){
    const f = currentFilters();
    let list = disponibles.filter(function(v){
      if(f.marca && v.marca !== f.marca) return false;
      if(f.linea && v.linea.toLowerCase().indexOf(f.linea) === -1) return false;
      if(f.anio && String(v.modelo) !== f.anio) return false;
      if(f.precioMin && v.precio < f.precioMin) return false;
      if(f.precioMax && v.precio > f.precioMax) return false;
      return true;
    });

    /* "Más recientes" es el orden en que ya llegan desde Supabase */
    const sortKey = els.sort.value;
    if(sortKey === "precio-asc") list = list.slice().sort(function(a,b){ return a.precio - b.precio; });
    if(sortKey === "precio-desc") list = list.slice().sort(function(a,b){ return b.precio - a.precio; });

    renderGrid(grid, list);
    if(els.count) els.count.textContent = list.length + (list.length === 1 ? " vehículo disponible" : " vehículos disponibles");
  }

  Object.keys(els).forEach(function(key){
    const el = els[key];
    if(!el || key === "reset" || key === "count") return;
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });

  if(els.reset){
    els.reset.addEventListener("click", function(){
      Object.keys(els).forEach(function(key){
        const el = els[key];
        if(!el || key === "reset" || key === "count" || key === "sort") return;
        el.value = "";
      });
      applyFilters();
    });
  }

  /* Prefiltros vía URL */
  const params = new URLSearchParams(window.location.search);
  if(params.get("marca")) els.marca.value = params.get("marca");
  if(params.get("precioMax")) els.precioMax.value = params.get("precioMax");
  applyFilters();
}

/* ---------- Inicio: los últimos vehículos publicados ---------- */
async function initHomeWidgets(){
  const recientes = document.getElementById("recientes-grid");
  if(!recientes) return;

  const vehicles = await fetchVehicles();
  fillOrHideSection(recientes, vehicles.slice(0,8).map(renderVehicleCard).join(""));
}

document.addEventListener("DOMContentLoaded", function(){
  initInventoryPage();
  initHomeWidgets();
});
