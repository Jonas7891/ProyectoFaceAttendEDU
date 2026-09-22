// ============================================================
//  FaceAttend EDU — StudentStorage
//
//  Capa de persistencia para la lista de estudiantes.
//  Usa AsyncStorage para guardar los estudiantes registrados
//  manualmente (formulario o importación) en el dispositivo.
//
//  Estructura almacenada:
//    KEY → JSON.stringify(Student[])
//
//  Los mockStudents son el "seed" inicial. Al arrancar, si no
//  existe nada en storage, se usan los mocks. Todo nuevo
//  estudiante se guarda aquí y se fusiona con los mocks.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockStudents } from "./mockData";
import type { Student } from "../types";

const STORAGE_KEY = "@faceattend_students";

// ── Genera un ID único simple ──────────────────────────────

function generateId(): string {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── API pública ────────────────────────────────────────────

/**
 * Carga todos los estudiantes:
 *  - Si hay datos guardados en storage, los devuelve.
 *  - Si no, devuelve los mockStudents como estado inicial.
 */
export async function loadStudents(): Promise<Student[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: Student[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
        // Primera vez: inicializar con los mocks y persistirlos
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockStudents));
        return mockStudents;
    } catch {
        return mockStudents;
    }
}

/**
 * Guarda la lista completa de estudiantes en storage.
 */
export async function saveStudents(students: Student[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
        // fallo silencioso — la UI ya tiene el estado en memoria
    }
}

/**
 * Agrega un nuevo estudiante a la lista persistida.
 * Retorna la lista completa actualizada.
 */
export async function addStudent(
    existing: Student[],
    draft: Omit<Student, "id">
): Promise<Student[]> {
    const newStudent: Student = { id: generateId(), ...draft };
    const updated = [...existing, newStudent];
    await saveStudents(updated);
    return updated;
}

/**
 * Agrega múltiples estudiantes de una vez (importación).
 * Retorna la lista completa actualizada.
 */
export async function addStudentsBulk(
    existing: Student[],
    drafts: Omit<Student, "id">[]
): Promise<Student[]> {
    const newStudents: Student[] = drafts.map(d => ({
        id: generateId(),
        ...d,
    }));
    const updated = [...existing, ...newStudents];
    await saveStudents(updated);
    return updated;
}
