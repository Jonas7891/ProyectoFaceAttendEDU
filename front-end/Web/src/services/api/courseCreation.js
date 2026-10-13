// ============================================================
//  FaceAttend EDU — Alta de cursos en el backend
//
//  POST /api/v1/courses { programId, code, name, status }.
//  `program_id` es FK NOT NULL: sin programa no hay curso.
//  Los IDs se resuelven en tiempo de ejecución (nunca hardcodeados)
//  y se aceptan respuestas camelCase o snake_case.
// ============================================================

import { academicApi } from "./academicApi";

function programIdOf(program) {
    return program?.programId ?? program?.program_id ?? program?.id ?? null;
}

function programListOf(response) {
    if (Array.isArray(response)) return response;
    return response?.content ?? [];
}

/**
 * Programas de la sede con su ID canónico.
 * @throws si no hay contexto de sede.
 */
export async function listSchoolPrograms(schoolId) {
    if (schoolId == null) throw new Error("No school context for programs");
    return programListOf(await academicApi.listSchoolPrograms(schoolId))
        .map((p) => ({
            programId: programIdOf(p),
            code: p?.code ?? "",
            name: p?.name ?? "",
        }))
        .filter((p) => p.programId != null);
}

/**
 * Crea el curso en el programa indicado.
 * @throws si falta el programa o el backend rechaza el payload.
 */
export async function createCourse({ programId, code, name }) {
    if (programId == null || String(programId).trim() === "") {
        throw new Error("A program is required");
    }
    const pid = Number(programId);
    if (!Number.isInteger(pid)) throw new Error("A program is required");
    return academicApi.createCourse({
        programId: pid,
        code: String(code).trim(),
        name: String(name).trim(),
        status: true,
    });
}

function normalizeProgramKey(value) {
    return String(value ?? "").trim().toLowerCase();
}

/**
 * Importación masiva: resuelve los programas una sola vez y crea
 * los cursos uno por uno. No se detiene ante fallos individuales.
 * @returns {{ success: number, errors: Array<{ course: string, reason: string }> }}
 */
export async function importCourses(schoolId, drafts) {
    const programs = await listSchoolPrograms(schoolId);
    const byKey = new Map();
    for (const program of programs) {
        if (normalizeProgramKey(program.code)) byKey.set(normalizeProgramKey(program.code), program);
        if (normalizeProgramKey(program.name)) byKey.set(normalizeProgramKey(program.name), program);
    }

    let success = 0;
    const errors = [];
    for (const draft of drafts ?? []) {
        const code = String(draft?.code ?? "").trim();
        const name = String(draft?.name ?? "").trim();
        const label = code || name || "Curso desconocido";
        if (!code || !name) {
            errors.push({ course: label, reason: "Código y nombre son requeridos" });
            continue;
        }
        const program = byKey.get(normalizeProgramKey(draft?.program));
        if (!program) {
            errors.push({ course: label, reason: "Programa no encontrado en la sede" });
            continue;
        }
        try {
            await createCourse({ programId: program.programId, code, name });
            success += 1;
        } catch (e) {
            errors.push({ course: label, reason: e?.message || "El backend rechazó el curso" });
        }
    }
    return { success, errors };
}
