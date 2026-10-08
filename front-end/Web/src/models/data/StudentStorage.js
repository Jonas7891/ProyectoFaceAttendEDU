// ============================================================
//  FaceAttend EDU — StudentStorage
//
//  Lectura de estudiantes: API académica (GET /academic-actors
//  filtrado por actor type STUDENT + /persons) con los mocks
//  como respaldo si falla.
//
//  Derivados que el backend aún no expone y se calculan aquí:
//  - course: cohorte matriculado -> bloques -> código del curso
//  - attendance: 0 hasta la fase de consulta de asistencia
//  - hasFacial / hasFingerprint: false (sin dato biométrico en
//    esta lista; el detalle biométrico es otra petición)
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_MODE } from "../../config/env";
import { mockStudents } from "./mockData";
import {
    actorTypeMap,
    attendanceSummaryFor,
    cohortMap,
    courseMap,
    fullName,
    listActors,
    listBlocks,
    listEnrollments,
    normalizeStatus,
    optional,
    personMap,
} from "../../services/api/referenceData";

const STORAGE_KEY = "@faceattend_students";
const LOCAL_PREFIX = "s_";

// ── Genera un ID único simple ──────────────────────────────

function generateId() {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Lectura ───────────────────────────────────────────────

async function localStudents() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (student) => typeof student?.id === "string" && student.id.startsWith(LOCAL_PREFIX)
        );
    } catch {
        return [];
    }
}

async function studentsFromApi() {
    // Tipos de actor y personas son necesarios: sin ellos no hay nombres
    // ni forma de separar estudiantes de instructores.
    const [actors, actorTypes, persons] = await Promise.all([
        listActors(),
        actorTypeMap(),
        personMap(),
    ]);
    if (!Array.isArray(actors)) return [];

    const studentType = [...actorTypes.values()].find(
        (type) => String(type.code ?? "").toUpperCase() === "STUDENT"
    );
    if (!studentType) throw new Error("no hay actor type STUDENT en el backend");

    const [enrollments, cohorts, blocks, courses] = await Promise.all([
        optional(listEnrollments(), []),
        optional(cohortMap(), new Map()),
        optional(listBlocks(), []),
        optional(courseMap(), new Map()),
    ]);

    const cohortOfActor = new Map(
        enrollments
            .filter((e) => String(e.enrollmentStatus ?? "").toLowerCase() !== "withdrawn")
            .map((e) => [e.academicActorId, e.cohortId])
    );

    const courseByCohort = new Map();
    for (const block of blocks) {
        if (block.cohortId && block.courseId && !courseByCohort.has(block.cohortId)) {
            courseByCohort.set(block.cohortId, block.courseId);
        }
    }

    const students = actors.filter((actor) => actor.actorTypeId === studentType.actorTypeId);

    // Porcentaje real de asistencia. Antes esta lista salía con attendance: 0 para
    // todos y nadie pedía nunca los registros, así que la vista de Reportes y los
    // indicadores del panel se calculaban sobre ceros: 0 % global y el 100 % de los
    // estudiantes marcados "en riesgo". El resumen llega agregado en SQL.
    const attendance = await optional(
        attendanceSummaryFor(students.map((actor) => actor.academicActorId)),
        new Map()
    );
    // Asistió = no estuvo ausente; la tardanza cuenta como asistencia y la
    // puntualidad se mide aparte.
    const rateOf = (actorId) => {
        const counts = attendance.get(actorId);
        if (!counts?.total) return 0;
        return Math.round(((counts.present + counts.late + counts.justified) / counts.total) * 100);
    };

    return students
        .map((actor) => {
            const person = persons.get(actor.personId);
            const cohortId = cohortOfActor.get(actor.academicActorId);
            const cohort = cohortId ? cohorts.get(cohortId) : null;
            const courseId = cohortId ? courseByCohort.get(cohortId) : null;
            const course = courseId ? courses.get(courseId) : null;

            return {
                id: String(actor.academicActorId),
                name: fullName(person) || actor.actorCode || "",
                email: person?.email ?? "",
                code: actor.actorCode ?? "",
                course: course?.code ?? "", // vacío: la UI lo omite de los programas
                // El código y el nombre del curso se repiten entre sedes ("MAT" existe
                // en las dos), así que buscar por ellos cuelga al estudiante del curso
                // equivocado. El id sí es único: es el que debe usarse para cruzar.
                courseId: courseId != null ? String(courseId) : null,
                grade: null, // lo rellena AppDataContext con el período del curso
                attendance: rateOf(actor.academicActorId),
                status: normalizeStatus(actor.status),
                hasFacial: false,
                hasFingerprint: false,
                document: person?.documentNumber ?? "",
                ficha: cohort?.code ?? "",
                personId: actor.personId,
            };
        });
}

/**
 * Carga todos los estudiantes: API primero, mocks como respaldo,
 * fusionados con las altas hechas localmente en la UI.
 */
export async function loadStudents() {
    const local = await localStudents();
    try {
        return [...(await studentsFromApi()), ...local];
    } catch (error) {
        if (API_MODE === "mock") {
            console.warn("[FaceAttend] loadStudents: API no disponible, uso mock —", error?.message);
            return [...mockStudents, ...local];
        }
        throw error;
    }
}

// ── Escritura local (pendiente de cablear al backend) ─────

export async function saveStudents(students) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
        // fallo silencioso — la UI ya tiene el estado en memoria
    }
}

export async function addStudent(existing, draft) {
    const newStudent = { id: generateId(), ...draft };
    const updated = [...existing, newStudent];
    await saveStudents(updated);
    return updated;
}

export async function addStudentsBulk(existing, drafts) {
    const newStudents = drafts.map(d => ({
        id: generateId(),
        ...d,
    }));
    const updated = [...existing, ...newStudents];
    await saveStudents(updated);
    return updated;
}
