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

## Mejoras de UX/UI

- **Editar prompt**: cada prompt propio abre una hoja modal con los campos
  C.R.A.F.T. precargados. Backend: `editarPrompt(rowIndex, nombre, data)`, que
  valida propiedad (igual que `eliminarPrompt`) antes de actualizar la fila.
- **Permisos claros**: los botones **Editar** y **Eliminar** solo aparecen en
  tus propios prompts. En la Biblioteca, los prompts de otras personas son de
  solo lectura (solo **Copiar**) — nadie puede borrar los tuyos. El backend
  también rechaza editar/eliminar filas ajenas.
- **Confirmación antes de eliminar** (modal), en vez del borrado instantáneo.
- **Estados de carga** (spinner) al traer los prompts.
- **Tarjetas** con autor, fecha, vista previa del contexto y chevron animado.
- **Buscador** con contador de resultados y botón para limpiar.
- **Formulario** con chips C.R.A.F.T., ayuda contextual y botón "Limpiar campos".
- **Cambiar nombre** desde la insignia de usuario en la cabecera.
- Micro-interacciones (feedback "Copiado ✓", animaciones) y etiquetas de
  accesibilidad en botones de ícono.

## Después de cualquier cambio: RE-DESPLEGAR

Editar el código en el editor de Apps Script **no** actualiza la URL `/exec`.
Hay que publicar una versión nueva:

1. **Implementar → Gestionar implementaciones**
2. Editar (✏️) la implementación web activa
3. **Versión → Nueva versión** → **Implementar**
4. Recargar la URL `/exec` (fuerza recarga: sin caché)

Si se prueba `/exec` sin re-desplegar, se sigue viendo la versión anterior del
código aunque el editor ya tenga los cambios.
