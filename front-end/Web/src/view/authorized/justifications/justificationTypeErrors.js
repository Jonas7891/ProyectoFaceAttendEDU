// ============================================================
//  Mensajes en español para los errores del servidor al gestionar
//  tipos de justificación (AUD-40): 403 y 409 no deben llegar como
//  «Error 403» / «Error 409».
// ============================================================

/**
 * @param {{status?: number, message?: string}|null} err
 * @param {string} fallback - texto cuando el servidor no da uno útil
 */
export function justificationTypeErrorMessage(err, fallback) {
    const status = err?.status;
    if (status === 403) {
        return "No tienes permiso para esta acción. Los tipos globales solo los gestiona el administrador global; puedes crear y editar los tipos de tu sede.";
    }
    if (status === 409) {
        return "Ya existe un tipo con ese nombre en tu sede (o entre los globales). Usa otro nombre.";
    }
    const message = err?.message;
    if (message && !/^Error \d+$/.test(message)) return message;
    return fallback;
}
