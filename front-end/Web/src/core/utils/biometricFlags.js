// Indicadores de biometría de las filas de usuarios.
//
// Las filas nacen con hasFacial/hasFingerprint en false: lo registrado vive en ms-biometric
// (GET /biometric/summary). La carga inicial y cualquier recarga de la lista deben aplicarlos,
// o la columna vuelve a "Pendiente" para todos.

import { buildPermissions } from "../../viewmodels/useRolePermissions";

/** Resumen de ms-biometric → conjuntos de personId (texto) con rostro y con huella. */
export function flagsFromSummary(summary) {
    return {
        face: new Set((summary?.face_person_ids ?? []).map(String)),
        fingerprint: new Set((summary?.fingerprint_person_ids ?? []).map(String)),
    };
}

/** Aplica los indicadores a las filas. Sin flags (consulta fallida o sin permiso) las filas quedan como están. */
export function withBiometricFlags(rows, flags) {
    if (!flags) return rows;
    return rows.map((row) =>
        row.personId == null
            ? row
            : {
                  ...row,
                  hasFacial: flags.face.has(String(row.personId)),
                  hasFingerprint: flags.fingerprint.has(String(row.personId)),
              }
    );
}

/**
 * Pide el resumen solo a los roles que tienen el permiso del endpoint
 * (attendance.record:write: administración e instructor). El aprendiz recibía un 403
 * en cada carga; sin permiso ni se hace la petición. Un fallo real devuelve null.
 */
export async function loadBiometricFlags(role, fetchSummary) {
    if (!buildPermissions(role).canViewBiometricSummary) return null;
    try {
        return flagsFromSummary(await fetchSummary());
    } catch {
        return null;
    }
}
