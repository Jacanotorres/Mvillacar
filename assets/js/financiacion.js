/* =========================================================
   MVillacar — simulador de cuota y solicitud de crédito
   Los parámetros (tasa, plazos, cuota inicial máxima) están en data.js.
   ========================================================= */

(async function(){
  const el = {
    vehiculo: document.getElementById("fin-vehiculo"),
    valor: document.getElementById("fin-valor"),
    plazos: document.getElementById("fin-plazos"),
    inicial: document.getElementById("fin-inicial"),
    inicialValor: document.getElementById("fin-inicial-valor"),
    inicialPct: document.getElementById("fin-inicial-pct"),
    inicialMax: document.getElementById("fin-inicial-max"),
    cuota: document.getElementById("fin-cuota"),
    financiar: document.getElementById("fin-financiar"),
    resInicial: document.getElementById("fin-res-inicial"),
    resPlazo: document.getElementById("fin-res-plazo"),
    tasa: document.getElementById("fin-tasa"),
    recap: document.getElementById("fin-recap"),
    form: document.getElementById("finance-form"),
    ingresos: document.getElementById("f-ingresos")
  };

  const state = { valor: 0, plazo: 60, pct: 30, vehiculo: null };

  /* Solo dígitos -> número; y número -> "80.000.000" mientras se escribe */
  function parseMoney(text){ return parseInt(String(text).replace(/\D/g, ""), 10) || 0; }
  function groupDigits(n){ return n ? n.toLocaleString("es-CO") : ""; }

  /* Cuota de un crédito con cuotas iguales. La tasa efectiva anual se pasa a
     tasa mensual equivalente: i = (1 + EA)^(1/12) - 1 */
  function monthlyPayment(principal, months){
    if(principal <= 0 || months <= 0) return 0;
    const i = Math.pow(1 + FINANCE_RATE_EA, 1 / 12) - 1;
    return principal * i / (1 - Math.pow(1 + i, -months));
  }

  function render(){
    const inicial = Math.round(state.valor * state.pct / 100);
    const financiar = Math.max(0, state.valor - inicial);
    const cuota = monthlyPayment(financiar, state.plazo);

    el.inicialValor.textContent = formatPrice(inicial);
    el.inicialPct.textContent = state.pct + " %";
    el.cuota.textContent = state.valor ? formatPrice(Math.round(cuota)) : "$ 0";
    el.financiar.textContent = state.valor ? formatPrice(financiar) : "—";
    el.resInicial.textContent = state.valor ? formatPrice(inicial) + " (" + state.pct + " %)" : "—";
    el.resPlazo.textContent = state.plazo + " meses";

    el.recap.innerHTML = state.valor
      ? '<strong>Tu simulación</strong>' +
        '<span>' + (state.vehiculo ? state.vehiculo : "Vehículo por definir") + '</span>' +
        '<span>Valor: ' + formatPrice(state.valor) + ' · Inicial: ' + formatPrice(inicial) + ' (' + state.pct + ' %) · ' + state.plazo + ' meses</span>' +
        '<span>Cuota aproximada: <b>' + formatPrice(Math.round(cuota)) + '</b> al mes</span>'
      : '<strong>Tu simulación</strong><span>Escribe el valor del carro arriba para ver tu cuota.</span>';
  }

  /* Configuración tomada de data.js */
  el.tasa.textContent = (FINANCE_RATE_EA * 100).toLocaleString("es-CO") + " %";
  el.inicial.max = FINANCE_MAX_INITIAL;
  el.inicialMax.textContent = FINANCE_MAX_INITIAL + " %";
  el.inicial.value = state.pct;

  el.plazos.innerHTML = FINANCE_TERMS.map(function(m){
    return '<button type="button" class="term-pill' + (m === state.plazo ? ' active' : '') + '" data-plazo="' + m + '" aria-pressed="' + (m === state.plazo) + '">' + m + '</button>';
  }).join("");
  el.plazos.addEventListener("click", function(e){
    const btn = e.target.closest("[data-plazo]");
    if(!btn) return;
    state.plazo = parseInt(btn.getAttribute("data-plazo"), 10);
    el.plazos.querySelectorAll(".term-pill").forEach(function(b){
      const on = b === btn;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    render();
  });

  el.valor.addEventListener("input", function(){
    state.valor = parseMoney(el.valor.value);
    el.valor.value = groupDigits(state.valor);
    /* Si escribe un valor propio, deja de contar como un vehículo del inventario */
    if(el.vehiculo.value){ el.vehiculo.value = ""; state.vehiculo = null; }
    render();
  });

  el.inicial.addEventListener("input", function(){
    state.pct = parseInt(el.inicial.value, 10) || 0;
    render();
  });

  el.ingresos.addEventListener("input", function(){
    el.ingresos.value = groupDigits(parseMoney(el.ingresos.value));
  });

  /* Vehículos del inventario para elegir (y precargar desde ?vehiculo=ID) */
  const vehicles = await fetchVehicles();
  vehicles.forEach(function(v){
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.marca + " " + v.linea + " " + v.modelo + " — " + formatPrice(v.precio);
    el.vehiculo.appendChild(opt);
  });

  function pickVehicle(id){
    const v = vehicles.find(function(x){ return x.id === id; });
    if(!v) return;
    el.vehiculo.value = v.id;
    state.vehiculo = v.marca + " " + v.linea + " " + v.modelo;
    state.valor = v.precio;
    el.valor.value = groupDigits(v.precio);
    render();
  }
  el.vehiculo.addEventListener("change", function(){
    if(!el.vehiculo.value){ state.vehiculo = null; render(); return; }
    pickVehicle(el.vehiculo.value);
  });

  const preselected = new URLSearchParams(window.location.search).get("vehiculo");
  if(preselected) pickVehicle(preselected);
  render();

  /* Solicitud: abre WhatsApp con los datos y la simulación */
  el.form.addEventListener("submit", function(e){
    e.preventDefault();
    const inicial = Math.round(state.valor * state.pct / 100);
    const cuota = Math.round(monthlyPayment(state.valor - inicial, state.plazo));
    const ingresos = parseMoney(el.ingresos.value);

    const lines = [
      "Hola, quiero solicitar financiación para un vehículo.",
      "",
      "Nombre: " + document.getElementById("f-nombre").value,
      "Celular: " + document.getElementById("f-celular").value,
      "Ciudad: " + document.getElementById("f-ciudad").value,
      "Soy: " + document.getElementById("f-ocupacion").value,
      "Ingresos mensuales: " + (ingresos ? formatPrice(ingresos) : "No indicado"),
      "",
      "Mi simulación:",
      "Vehículo: " + (state.vehiculo || "Por definir"),
      "Valor del carro: " + (state.valor ? formatPrice(state.valor) : "No indicado"),
      "Cuota inicial: " + (state.valor ? formatPrice(inicial) + " (" + state.pct + " %)" : "—"),
      "Plazo: " + state.plazo + " meses",
      "Cuota mensual aproximada: " + (state.valor ? formatPrice(cuota) : "—")
    ];
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
})();
