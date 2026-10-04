/* =========================================================
   MVillacar — autenticación y roles (Supabase Auth)
   ========================================================= */

/* Sesión + perfil (rol) del usuario actual, o null si no hay sesión
   o si su cuenta no tiene un perfil/rol asignado. */
async function getCurrentProfile(){
  if(!supabaseClient) return null;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if(!session) return null;
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();
  if(error || !profile) return null;
  return { id: session.user.id, email: session.user.email, role: profile.role, nombre: profile.nombre };
}

async function signIn(email, password){
  if(!supabaseClient) return { error: { message: "Supabase no está configurado" } };
  return supabaseClient.auth.signInWithPassword({ email: email, password: password });
}

async function signOut(){
  if(supabaseClient) await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

/* Exige que haya sesión y (si se pasan roles) que el rol del usuario
   esté entre los permitidos. Si no, redirige a login.html.
   Uso: const perfil = await requireRole(["admin","asesor"]); */
async function requireRole(allowedRoles){
  const profile = await getCurrentProfile();
  if(!profile || (allowedRoles && allowedRoles.indexOf(profile.role) === -1)){
    window.location.href = "login.html";
    return new Promise(function(){}); /* nunca resuelve: ya estamos redirigiendo */
  }
  return profile;
}
