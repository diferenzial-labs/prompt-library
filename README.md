# Biblioteca de Prompts — Taller ANIA

App interna (Google Apps Script + HTML/Tailwind) para registrar y consultar
prompts C.R.A.F.T. durante el taller de Diferenzia con ANIA.

- **Backend:** `Code.gs` — Google Sheet como base de datos (hoja `Prompts`).
- **Frontend:** `index.html` — un solo archivo, Tailwind + Material Icons vía CDN.

## Bug de lectura resuelto

**Síntoma:** guardar un prompt funcionaba (la fila aparecía en la hoja), pero
leer no mostraba nada ni en "Mis prompts" ni en "Biblioteca".

**Causa raíz:** `obtenerPrompts()` devolvía cada prompt con `Timestamp` como
objeto `Date`. `google.script.run` **no puede serializar objetos `Date` en el
valor de retorno** (ni ningún tipo prohibido anidado dentro de objetos/arrays),
así que la transferencia fallaba y el `withSuccessHandler` nunca se ejecutaba.
Por eso `guardarPrompt` (que solo devuelve strings) sí funcionaba y
`obtenerPrompts` no.

**Fix:** en `obtenerPrompts()` cada celda se normaliza a string antes de
retornar, y las fechas se formatean con `Utilities.formatDate`. Así el payload
ya no contiene `Date` y el frontend recibe los datos.

Cambios secundarios:
- `copiarPrompt` ahora recibe `rowIndex` y busca el prompt en `allPrompts`, en
  vez de inyectar `JSON.stringify(p)` dentro del atributo `onclick` (que se
  rompía con comillas u otros caracteres especiales en el contenido).
- Se retiró el toast de diagnóstico temporal ("Se cargaron X prompts").

## Después de cualquier cambio: RE-DESPLEGAR

Editar el código en el editor de Apps Script **no** actualiza la URL `/exec`.
Hay que publicar una versión nueva:

1. **Implementar → Gestionar implementaciones**
2. Editar (✏️) la implementación web activa
3. **Versión → Nueva versión** → **Implementar**
4. Recargar la URL `/exec` (fuerza recarga: sin caché)

Si se prueba `/exec` sin re-desplegar, se sigue viendo la versión anterior del
código aunque el editor ya tenga los cambios.
