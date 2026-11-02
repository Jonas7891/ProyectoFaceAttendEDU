// ============================================================
//  FaceAttend EDU — localCache (AUD-59)
//
//  Las altas locales de estudiantes, usuarios, cursos, fichas y ambientes se guardan en
//  AsyncStorage (localStorage en web) bajo claves "@faceattend_*". Antes eran un arreglo plano
//  compartido por todas las sesiones del navegador: un administrador de otra sede o un usuario
//  anterior veía esas filas mezcladas con las del backend.
//
//  Ahora cada clave guarda un sobre { userId, schoolId, rows } y solo se lee si coincide con la
//  sesión actual. Lo viejo (arreglo sin sobre) se ignora. Al cerrar sesión o cambiar de usuario
//  se borran las claves "@faceattend_*" (con guion bajo). Las preferencias (@faceattend:theme_*,
//  faceattend_language) y la configuración institucional no se tocan.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";

const DOMAIN_PREFIX = "@faceattend_";

let scope = null;

/** Fija la sesión dueña de la caché: { userId, schoolId } o null sin sesión. */
export function setCacheScope(next) {
    scope = next?.userId != null ? { userId: String(next.userId), schoolId: next.schoolId ?? null } : null;
}

const sameScope = (envelope) =>
    scope !== null &&
    envelope !== null &&
    typeof envelope === "object" &&
    !Array.isArray(envelope) &&
    Array.isArray(envelope.rows) &&
    String(envelope.userId) === scope.userId &&
    String(envelope.schoolId ?? null) === String(scope.schoolId ?? null);

function parse(raw) {
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** Filas guardadas por la sesión actual bajo la clave; [] si son de otra sesión, viejas o no hay sesión. */
export async function readLocalRows(key) {
    if (!scope) return [];
    try {
        const envelope = parse(await AsyncStorage.getItem(key));
        return sameScope(envelope) ? envelope.rows : [];
    } catch {
        return [];
    }
}

/** Guarda las filas con el usuario y la sede de la sesión. Sin sesión no escribe. */
export async function writeLocalRows(key, rows) {
    if (!scope) return;
    try {
        await AsyncStorage.setItem(
            key,
            JSON.stringify({ userId: scope.userId, schoolId: scope.schoolId, rows })
        );
    } catch {
        /* fallo silencioso — la UI ya tiene el estado en memoria */
    }
}

async function domainKeys() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        return (keys ?? []).filter((key) => typeof key === "string" && key.startsWith(DOMAIN_PREFIX));
    } catch {
        return [];
    }
}

/** Borra todos los datos de dominio guardados (cierre de sesión). */
export async function clearDomainCache() {
    for (const key of await domainKeys()) {
        try {
            await AsyncStorage.removeItem(key);
        } catch {
            /* almacenamiento no disponible */
        }
    }
}

/** Borra lo que no pertenece a la sesión actual (otro usuario/sede o formato viejo sin sobre). */
export async function purgeForeignDomainCache() {
    for (const key of await domainKeys()) {
        try {
            if (!sameScope(parse(await AsyncStorage.getItem(key)))) await AsyncStorage.removeItem(key);
        } catch {
            /* almacenamiento no disponible */
        }
    }
}
