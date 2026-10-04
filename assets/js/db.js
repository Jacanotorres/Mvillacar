/* =========================================================
   MVillacar — acceso a los datos (Supabase)
   Reemplaza los arreglos estáticos VEHICLES/TEAM/HAPPY_CLIENTS
   de data.js: ahora el inventario, el equipo y los clientes
   felices se leen (y se administran desde panel.html) en Supabase.
   ========================================================= */

/* Convierte una fila de la tabla "vehicles" (+ sus vehicle_photos) al
   objeto que usan catalog.js, vehiculo.js y el panel.
   MVillacar publica cada carro solo con marca, modelo, año, descripción
   y precio. OJO con los nombres de la tabla: la columna "linea" guarda el
   modelo (ej. "Mazda 3") y la columna "modelo" guarda el año. */
function normalizeVehicle(row){
  const fotos = (row.vehicle_photos || [])
    .slice()
    .sort(function(a, b){ return a.posicion - b.posicion; })
    .map(function(p){ return p.url; });
  return {
    id: row.id,
    marca: row.marca,
    linea: row.linea,
    modelo: row.modelo,
    precio: row.precio,
    descripcion: row.descripcion || "",
    fechaIngreso: row.fecha_ingreso,
    fotos: fotos
  };
}

async function fetchVehicles(){
  if(!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("*, vehicle_photos(url, posicion)")
    .order("fecha_ingreso", { ascending: false })
    .order("updated_at", { ascending: false });
  if(error){
    console.error("Error cargando el inventario:", error);
    return [];
  }
  return data.map(normalizeVehicle);
}

async function fetchVehicleById(id){
  if(!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("*, vehicle_photos(url, posicion)")
    .eq("id", id)
    .maybeSingle();
  if(error || !data){
    if(error) console.error("Error cargando el vehículo:", error);
    return null;
  }
  return normalizeVehicle(data);
}

async function fetchTeam(){
  if(!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("team")
    .select("*")
    .order("orden", { ascending: true });
  if(error){
    console.error("Error cargando el equipo:", error);
    return [];
  }
  return data;
}

async function fetchHappyClients(){
  if(!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("happy_clients")
    .select("*")
    .order("orden", { ascending: true });
  if(error){
    console.error("Error cargando clientes felices:", error);
    return [];
  }
  return data.map(function(c){ return { foto: c.foto }; });
}

/* Galería del concesionario (página "Nosotros"): fotos y videos en orden */
async function fetchGallery(){
  if(!supabaseClient) return [];
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("orden", { ascending: true });
  if(error){
    console.error("Error cargando la galería:", error);
    return [];
  }
  return data;
}
