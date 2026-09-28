// ============================================================
//  FaceAttend EDU — FichaStorage
//
//  Capa de persistencia para las fichas/cursos.
//  Usa AsyncStorage para guardar fichas registradas
//  manualmente (formulario o importación) en el dispositivo.
//
//  Estructura almacenada:
//    KEY → JSON.stringify(Ficha[])
//
//  Los mockFichas son el "seed" inicial. Al arrancar, si no
//  existe nada en storage, se usan los mocks. Toda nueva
//  ficha se guarda aquí y se fusiona con los mocks.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockFichas } from "./mockData";

const STORAGE_KEY = "@faceattend_fichas";

// ── Genera un ID único simple ──────────────────────────────

function generateId() {
    return `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Colores predeterminados para fichas ────────────────────

const DEFAULT_COLORS = [
    "#4F6BED",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
    "#F97316",
    "#84CC16",
];

function getDefaultColor(index) {
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

// ── Asignar colores a mockFichas si no los tienen ──────────

function ensureFichasHaveColors(fichas) {
    return fichas.map((f, i) => ({
        ...f,
        color: f.color || getDefaultColor(i),
    }));
}

// ── API pública ────────────────────────────────────────────

/**
 * Carga todas las fichas:
 *  - Si hay datos guardados en storage, los devuelve.
 *  - Si no, devuelve los mockFichas como estado inicial.
 */
export async function loadFichas() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return ensureFichasHaveColors(parsed);
            }
        }
        // Primera vez: inicializar con los mocks (con colores) y persistirlos
        const initialFichas = ensureFichasHaveColors(mockFichas);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialFichas));
        return initialFichas;
    } catch (error) {
        return ensureFichasHaveColors(mockFichas);
    }
}

/**
 * Guarda la lista completa de fichas en storage.
 */
export async function saveFichas(fichas) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fichas));
    } catch (error) {
        // fallo silencioso — la UI ya tiene el estado en memoria
    }
}

/**
 * Agrega una nueva ficha a la lista persistida.
 * Retorna la lista completa actualizada.
 */
export async function addFicha(existing, draft) {
    const newFicha = {
        id: generateId(),
        color: draft.color || getDefaultColor(existing.length),
        ...draft,
    };
    const updated = [...existing, newFicha];
    await saveFichas(updated);
    return updated;
}

/**
 * Actualiza una ficha existente.
 * Retorna la lista completa actualizada.
 */
export async function updateFicha(existing, id, patch) {
    const updated = existing.map((f) => (f.id === id ? { ...f, ...patch } : f));
    await saveFichas(updated);
    return updated;
}

/**
 * Elimina una ficha.
 * Retorna la lista completa actualizada.
 */
export async function deleteFicha(existing, id) {
    const updated = existing.filter((f) => f.id !== id);
    await saveFichas(updated);
    return updated;
}
