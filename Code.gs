const SHEET_ID = "1zI9namI444O-APy6EzblEGg5_njMlcJT4EENTZ_UvsU";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Biblioteca de Prompts — Taller ANIA')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function obtenerHojaPrompts_(ss) {
  let sheet = ss.getSheetByName('Prompts');
  if (!sheet) {
    sheet = ss.insertSheet('Prompts');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Nombre', 'Titulo', 'Contexto', 'Rol', 'Accion', 'Formato', 'Tono']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function guardarPrompt(data) {
  try {
    if (!data.nombre || !data.titulo || !data.contexto || !data.rol || !data.accion || !data.formato || !data.tono) {
      return { status: 'error', message: 'Completa todos los campos antes de guardar.' };
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = obtenerHojaPrompts_(ss);
    sheet.appendRow([
      new Date(),
      data.nombre.trim(),
      data.titulo.trim(),
      data.contexto.trim(),
      data.rol.trim(),
      data.accion.trim(),
      data.formato.trim(),
      data.tono.trim()
    ]);
    return { status: 'success', message: 'Prompt guardado en la biblioteca.' };
  } catch (e) {
    return { status: 'error', message: 'Error: ' + e.message };
  }
}

function editarPrompt(rowIndex, nombre, data) {
  try {
    if (!data.titulo || !data.contexto || !data.rol || !data.accion || !data.formato || !data.tono) {
      return { status: 'error', message: 'Completa todos los campos antes de guardar.' };
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = obtenerHojaPrompts_(ss);
    // Verifica que la fila pertenezca a quien intenta editar.
    const filaNombre = sheet.getRange(rowIndex, 2).getValue();
    if (String(filaNombre).trim().toLowerCase() !== String(nombre).trim().toLowerCase()) {
      return { status: 'error', message: 'Solo puedes editar tus propios prompts.' };
    }
    // Columnas 3..8: Titulo, Contexto, Rol, Accion, Formato, Tono
    // (No se toca Timestamp ni Nombre.)
    sheet.getRange(rowIndex, 3, 1, 6).setValues([[
      data.titulo.trim(),
      data.contexto.trim(),
      data.rol.trim(),
      data.accion.trim(),
      data.formato.trim(),
      data.tono.trim()
    ]]);
    return { status: 'success', message: 'Prompt actualizado.' };
  } catch (e) {
    return { status: 'error', message: 'Error: ' + e.message };
  }
}

function obtenerPrompts() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = obtenerHojaPrompts_(ss);
    const values = sheet.getDataRange().getValues();

    // Solo el encabezado (o vacía): no hay prompts todavía.
    if (values.length < 2) {
      return { status: 'success', data: [] };
    }

    const headers = values.shift();
    const tz = ss.getSpreadsheetTimeZone();

    const prompts = values.map((row, i) => {
      const obj = { rowIndex: i + 2 };
      headers.forEach((h, idx) => {
        const val = row[idx];
        // IMPORTANTE: google.script.run NO puede serializar objetos Date en el
        // valor de retorno (ni ningún tipo prohibido anidado). Si dejamos el
        // Timestamp como Date, la transferencia falla y el withSuccessHandler
        // nunca corre — por eso guardar funcionaba pero leer no. Convertimos
        // cada celda a string (y las fechas a texto formateado).
        if (val instanceof Date) {
          obj[h] = Utilities.formatDate(val, tz, 'yyyy-MM-dd HH:mm');
        } else if (val === null || val === undefined) {
          obj[h] = '';
        } else {
          obj[h] = String(val);
        }
      });
      return obj;
    }).reverse();

    return { status: 'success', data: prompts };
  } catch (e) {
    return { status: 'error', message: e.message };
  }
}

function eliminarPrompt(rowIndex, nombre) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Prompts');
    const filaNombre = sheet.getRange(rowIndex, 2).getValue();
    if (String(filaNombre).trim().toLowerCase() !== String(nombre).trim().toLowerCase()) {
      return { status: 'error', message: 'Solo puedes eliminar tus propios prompts.' };
    }
    sheet.deleteRow(rowIndex);
    return { status: 'success', message: 'Prompt eliminado.' };
  } catch (e) {
    return { status: 'error', message: 'Error: ' + e.message };
  }
}
