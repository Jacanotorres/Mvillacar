# Chatbot de WhatsApp — guía de puesta en marcha

El bot vive en una Edge Function de Supabase (`supabase/functions/whatsapp-bot/index.ts`).
Meta le envía cada mensaje del cliente, Claude responde consultando el inventario real
(tablas `vehicles`, `vehicle_photos`, `team`) y la respuesta sale por la API oficial de WhatsApp.

Qué hace el bot: buscar carros del inventario y mandar fotos, simular la cuota del crédito
(misma fórmula y tasa que `financiacion.html`), registrar solicitudes de venta o retoma
en `vende_tu_carro`, dar horario y teléfono, y pasar al cliente con un asesor (enlace de WhatsApp del equipo).

> El bot está listo en el código pero **no funciona hasta hacer los pasos de abajo** (cuenta de Meta,
> llave de Anthropic y despliegue). Mientras tanto el sitio funciona igual que siempre.

## 1. Base de datos

Supabase → SQL Editor → pegar y correr `supabase-setup-whatsapp-bot.sql`.

## 2. Cuenta de Meta (lo haces tú, en el navegador)

1. Entra a <https://developers.facebook.com> → *My Apps* → *Create App* → tipo **Business**.
2. Agrega el producto **WhatsApp**. Vincula (o crea) tu cuenta de Meta Business.
3. En *WhatsApp → API Setup* verás un número de prueba, el **Phone number ID** y un token temporal (24 h).
   Con eso ya puedes probar enviando mensajes a hasta 5 números que registres.
4. Para producción: agrega el número real de la empresa, y crea un **token permanente**
   (Business Settings → System Users → crear usuario del sistema → asignarle la app con permiso
   `whatsapp_business_messaging` y `whatsapp_business_management` → *Generate token*, sin vencimiento).
5. Anota: **Phone number ID**, **token**, y el **App Secret** (App settings → Basic).

> ⚠️ **El número del bot no puede usarse a la vez en la app de WhatsApp Business del celular**
> (salvo que actives el modo "coexistencia" de Meta). Lo más simple: un número nuevo para el bot, o
> migrar el `+57 318 665 1831` a la API y que los asesores atiendan desde sus propios WhatsApp
> (el bot les manda a los clientes el enlace directo).

## 3. Desplegar la función

Instala el CLI (`brew install supabase/tap/supabase`), entra a la carpeta del proyecto y:

```bash
supabase login
supabase link --project-ref fpmslcgvqbdlhwlqyzsk
supabase secrets set \
  ANTHROPIC_API_KEY=... \
  WHATSAPP_TOKEN=... \
  WHATSAPP_PHONE_NUMBER_ID=... \
  WHATSAPP_APP_SECRET=... \
  WHATSAPP_VERIFY_TOKEN=una-frase-larga-que-inventes
supabase functions deploy whatsapp-bot --no-verify-jwt
```

(`WHATSAPP_VERIFY_TOKEN` lo inventas tú; solo debe coincidir con el del paso 4. Los enlaces a los
carros salen con `https://mvillacar.vercel.app`; cuando `mvillacar.com` quede conectado, agrega
`SITE_URL=https://mvillacar.com`.)

## 4. Conectar el webhook en Meta

WhatsApp → *Configuration* → Webhook:

- **Callback URL:** `https://fpmslcgvqbdlhwlqyzsk.supabase.co/functions/v1/whatsapp-bot`
- **Verify token:** el mismo `WHATSAPP_VERIFY_TOKEN`
- Pulsa *Verify and save* y suscríbete al campo **messages**.

Escribe al número del bot desde tu celular: debería responder.

## Cosas a saber

- **Ventana de 24 h:** el bot solo puede responder dentro de las 24 h siguientes al último mensaje
  del cliente (regla de Meta). Para escribir primero hacen falta plantillas aprobadas.
- **Costo:** Meta cobra por conversación según su tarifa vigente, más el uso de Claude
  (modelo `claude-opus-5-5` con esfuerzo bajo). Hay un tope de 30 mensajes por cliente por hora.
  Si quieres abaratar, cambia `MODEL` en `index.ts` (p. ej. `claude-sonnet-5-5`).
- **Ver conversaciones:** Supabase → Table Editor → `whatsapp_messages`.
- **Ver logs:** Supabase → Edge Functions → whatsapp-bot → Logs.
- **Cambiar el tono o las reglas:** edita `SYSTEM_PROMPT` en `index.ts` y vuelve a desplegar.
- Si cambias teléfono, horario, dirección o tasa en `assets/js/data.js`, actualiza `BUSINESS` y `FINANCE`
  al inicio de `index.ts` (la función no puede importar ese archivo).
